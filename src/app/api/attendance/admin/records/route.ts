import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";
import TestUsers from "@/models/TestUsers";
import StudentSession from "@/models/StudentSession";
import AttendanceSettings from "@/models/AttendanceSettings";
import jwt from "jsonwebtoken";

interface DecodedToken {
  email: string;
  id: string;
}

interface StudentUser {
  _id: string;
  email: string;
  campus?: string;
  [key: string]: unknown;
}

// Handle POST requests for QR code attendance recording
export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    
    let data;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        return NextResponse.json({
          success: false,
          message: "Empty request body"
        }, { status: 400 });
      }
      data = JSON.parse(bodyText);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json({
        success: false,
        message: "Invalid request format"
      }, { status: 400 });
    }
    
    const { token, qrData, email, deviceId, type, studentLocation } = data || {};
    
    if (!token || !qrData || !email || !deviceId || !type) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }
    
    let qrPayload;
    try {
      qrPayload = JSON.parse(qrData);
    } catch  {
      return NextResponse.json({
        success: false,
        message: "Invalid QR code format"
      }, { status: 400 });
    }
    
    if (qrPayload.type !== 'check-in' && qrPayload.type !== 'check-out') {
      return NextResponse.json({
        success: false,
        message: "Invalid QR type. Must be 'check-in' or 'check-out'"
      }, { status: 400 });
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if QR code has a timestamp and validate expiration
    const expiresAt = qrPayload.expiresAt || (qrPayload.timestamp + 10); // Default to 10 seconds if no expiresAt
    
    // Ensure QR code is not expired
    if (currentTime > expiresAt) {
      return NextResponse.json({
        success: false,
        message: "QR code has expired. Please scan a fresh code."
      }, { status: 400 });
    }
    
    // Verify signature if needed
    const adminSignature = process.env.NEXT_PUBLIC_ADMIN_SIGNATURE || 'default-signature';
    if (qrPayload.adminSignature !== adminSignature) {
      // Log potential security breach
      console.warn(`[SECURITY] Invalid QR signature attempt from ${email} with deviceId ${deviceId}`);
      
      return NextResponse.json({
        success: false,
        message: "Invalid QR code signature"
      }, { status: 400 });
    }
    
    // Get current attendance settings
    const settingsQuery = await AttendanceSettings.findOne({}).lean();
    const settings = Array.isArray(settingsQuery) ? settingsQuery[0] : settingsQuery || { 
      geoLocationEnabled: false, 
      defaultRadius: 50 
    };
    
    // Verify geolocation if enabled
    if (settings.geoLocationEnabled && qrPayload.geoRequired) {
      // If geolocation is required but not provided by the student
      if (!studentLocation || !studentLocation.latitude || !studentLocation.longitude) {
        return NextResponse.json({
          success: false,
          message: "Location access is required for attendance. Please enable location and try again."
        }, { status: 400 });
      }
      
      // If QR has location data, verify student's location is within allowed radius
      if (qrPayload.location) {
        const distance = calculateDistance(
          studentLocation.latitude,
          studentLocation.longitude,
          qrPayload.location.latitude,
          qrPayload.location.longitude
        );
        
        const allowedRadius = qrPayload.location.radius || settings.defaultRadius || 50;
        
        if (distance > allowedRadius) {
          // Log the location mismatch
          console.warn(`[LOCATION] Student ${email} attempted attendance from ${distance.toFixed(1)}m away, outside the ${allowedRadius}m radius`);
          
          return NextResponse.json({
            success: false,
            message: `You must be within ${allowedRadius} meters of the classroom to record attendance. You are approximately ${Math.round(distance)}m away.`
          }, { status: 403 });
        }
        
        // If campus is specified in QR, verify student belongs to that campus
        if (qrPayload.location.campus) {
          const student = await TestUsers.findOne({ email }).lean();
          
          // Check if student is an object and has a campus property
          if (student && !Array.isArray(student) && 'campus' in student && student.campus && student.campus.toLowerCase() !== qrPayload.location.campus.toLowerCase()) {
            // Log the campus mismatch
            console.warn(`[CAMPUS] Student ${email} from campus ${student.campus} attempted attendance for campus ${qrPayload.location.campus}`);
            
            return NextResponse.json({
              success: false,
              message: `This attendance QR is for ${qrPayload.location.campus.toUpperCase()} campus. You are registered for ${student.campus.toUpperCase()} campus.`
            }, { status: 403 });
          }
        }
      }
    }
    
    // Verify token and get student info
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    } catch  {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 });
    }
    
    if (decoded.email !== email) {
      console.warn(`[SECURITY] Token email mismatch: token ${decoded.email} vs request ${email}`);
      return NextResponse.json({
        success: false,
        message: "Token email mismatch"
      }, { status: 401 });
    }
    
    // Check if student exists
    const student = await TestUsers.findOne({ email }).lean() as StudentUser | null;
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found"
      }, { status: 404 });
    }
    
    // Verify session and device match
    const session = await StudentSession.findOne({
      email,
      isActive: true,
    }).lean();
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "No active session found"
      }, { status: 401 });
    }

    if (Array.isArray(session) || !session.deviceId) {
      return NextResponse.json({
        success: false,
        message: "Session data is invalid"
      }, { status: 500 });
    }
    
    if (session.deviceId !== deviceId) {
      console.warn(`[SECURITY] Device mismatch for ${email}: session ${session.deviceId} vs request ${deviceId}`);
      
      return NextResponse.json({
        success: false,
        message: "This session is bound to a different device. Please use the original device."
      }, { status: 403 });
    }
    
    // Check if this nonce has been used before (to prevent QR code reuse)
    if (qrPayload.nonce) {
      const existingNonceRecord = await StudentSession.findOne({
        'scanHistory.nonce': qrPayload.nonce
      });
      
      if (existingNonceRecord) {
        return NextResponse.json({
          success: false,
          message: "This QR code has already been used. Please scan a fresh code."
        }, { status: 400 });
      }
    }
    
    // Determine the current date (reset to start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Look for existing attendance record for today
    let attendanceRecord = await Attendance.findOne({
      email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 });
    
    const now = new Date();
    
    if (attendanceRecord) {
      const lastActionTime = attendanceRecord.lastAction === 'check-in' 
        ? attendanceRecord.checkInTime 
        : attendanceRecord.checkOutTime;
        
      if (lastActionTime) {
        const timeSinceLastAction = now.getTime() - new Date(lastActionTime).getTime();
     
        if (timeSinceLastAction < 10000) {
          return NextResponse.json({
            success: false,
            message: "Please wait before scanning again"
          }, { status: 429 }); 
        }
      }
    }
    
    if (qrPayload.type === 'check-in') {
      if (!attendanceRecord) {
        attendanceRecord = new Attendance({
          email,
          testUserId: student._id,
          date: today,
          checkInTime: now,
          status: 'present',
          lastAction: 'check-in',
          location: studentLocation ? {
            latitude: studentLocation.latitude,
            longitude: studentLocation.longitude,
            campus: qrPayload.location ? qrPayload.location.campus : null
          } : null
        });
      } else if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime) {
        return NextResponse.json({
          success: true,
          message: "You have already completed your attendance for today",
          lastCheckIn: attendanceRecord.checkInTime,
          lastCheckOut: attendanceRecord.checkOutTime,
          lastAction: 'complete'
        });
      } else if (attendanceRecord.lastAction === 'check-in') {
        return NextResponse.json({
          success: true,
          message: "You are already checked in",
          lastCheckIn: attendanceRecord.checkInTime,
          lastCheckOut: attendanceRecord.checkOutTime,
          lastAction: attendanceRecord.lastAction
        });
      } else {
        // Update existing record with new check-in (after a check-out)
        attendanceRecord.checkInTime = now;
        attendanceRecord.lastAction = 'check-in';
        
        // Update location if provided
        if (studentLocation) {
          attendanceRecord.checkInLocation = {
            latitude: studentLocation.latitude,
            longitude: studentLocation.longitude,
            campus: qrPayload.location ? qrPayload.location.campus : null
          };
        }
        
        if (attendanceRecord.status === 'half-day') {
          attendanceRecord.status = 'present';
        }
      }
    } else if (qrPayload.type === 'check-out') {
      if (!attendanceRecord || !attendanceRecord.checkInTime) {
        return NextResponse.json({
          success: false,
          message: "You need to check in first"
        }, { status: 400 });
      }
      
      if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime && attendanceRecord.lastAction === 'check-out') {
        return NextResponse.json({
          success: true,
          message: "You have already completed your attendance for today",
          lastCheckIn: attendanceRecord.checkInTime,
          lastCheckOut: attendanceRecord.checkOutTime,
          lastAction: 'complete'
        });
      }
      
      attendanceRecord.checkOutTime = now;
      attendanceRecord.lastAction = 'check-out';
      
      // Update location if provided
      if (studentLocation) {
        attendanceRecord.checkOutLocation = {
          latitude: studentLocation.latitude,
          longitude: studentLocation.longitude,
          campus: qrPayload.location ? qrPayload.location.campus : null
        };
      }

      const checkInTime = new Date(attendanceRecord.checkInTime).getTime();
      const checkOutTime = now.getTime();
      const durationMinutes = Math.round((checkOutTime - checkInTime) / 60000);
      attendanceRecord.duration = durationMinutes;
      
      if (durationMinutes < 240) { 
        attendanceRecord.status = 'half-day';
      } else {
        attendanceRecord.status = 'present';
      }
    }
    
    try {
      // Save attendance record
      await attendanceRecord.save();
      
      // Update session with nonce to prevent reuse and add to attendance history
      await StudentSession.findOneAndUpdate(
        { email, isActive: true },
        {
          lastActive: now,
          $push: {
            scanHistory: qrPayload.nonce ? {
              nonce: qrPayload.nonce,
              timestamp: now,
              action: qrPayload.type,
              location: studentLocation || null
            } : {
              nonce: "legacy-" + Date.now(),
              timestamp: now,
              action: qrPayload.type,
              location: studentLocation || null
            },
            attendanceHistory: {
              date: today,
              checkInTime: attendanceRecord.checkInTime,
              checkOutTime: attendanceRecord.checkOutTime,
              duration: attendanceRecord.duration,
              status: attendanceRecord.status,
              location: studentLocation || null
            }
          },
          $inc: { totalAttendance: qrPayload.type === 'check-out' ? 1 : 0 }
        }
      );
    } catch (error) {
      console.error("Error saving attendance record:", error);
      return NextResponse.json({
        success: false,
        message: "Failed to save attendance record"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `${qrPayload.type === 'check-in' ? 'Check-in' : 'Check-out'} recorded successfully`,
      lastCheckIn: attendanceRecord.checkInTime,
      lastCheckOut: attendanceRecord.checkOutTime,
      lastAction: attendanceRecord.lastAction
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}


function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180; 
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
}

export async function GET() {
  return NextResponse.json({
    success: true
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}