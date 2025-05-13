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

interface Student {
  _id: string;
  email: string;
  campus?: string;
  [key: string]: unknown;
}

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
    
    // Get current attendance settings
    const settingsData = await AttendanceSettings.findOne().sort({ createdAt: -1 }).lean() || {
      maxQrValiditySeconds: 300,
      geoLocationEnabled: false,
      defaultRadius: 50
    };
    
    // Ensure settings is an object, not an array
    const settings = Array.isArray(settingsData) 
      ? { maxQrValiditySeconds: 300, geoLocationEnabled: false, defaultRadius: 50 } 
      : settingsData;
    
    // Check if QR code has expired
    const maxValidity = settings.maxQrValiditySeconds || 300;
    
    const isExpired = qrPayload.expiresAt 
      ? currentTime > qrPayload.expiresAt 
      : currentTime - qrPayload.timestamp > maxValidity; 
    
    if (isExpired) {
      return NextResponse.json({
        success: false,
        message: "QR code has expired. Please scan a fresh code."
      }, { status: 400 });
    }
    
    // Verify signature if needed
    const adminSignature = process.env.NEXT_PUBLIC_ADMIN_SIGNATURE || 'default-signature';
    if (qrPayload.adminSignature !== adminSignature) {
      return NextResponse.json({
        success: false,
        message: "Invalid QR code signature"
      }, { status: 400 });
    }
    
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
          
          if (student && 'campus' in student && student.campus && student.campus.toLowerCase() !== qrPayload.location.campus.toLowerCase()) {
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
    
    // Verify that the email matches the token
    if (decoded.email !== email) {
      return NextResponse.json({
        success: false,
        message: "Token email mismatch"
      }, { status: 401 });
    }
    
    // Check if student exists
    const student = await TestUsers.findOne({ email }).lean() as Student | null;
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found"
      }, { status: 404 });
    }
    
    // Verify session
    const session = await StudentSession.findOne({
      email,
      isActive: true,
      deviceId
    }).lean();
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "No active session found for this device"
      }, { status: 401 });
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
    
    if (qrPayload.type === 'check-in') {
      // Handle check-in
      if (!attendanceRecord) {
        // Create new attendance record
        attendanceRecord = new Attendance({
          email,
          testUserId: student._id,
          date: today,
          checkInTime: now,
          status: 'present',
          lastAction: 'check-in',
          checkInLocation: studentLocation ? {
            latitude: studentLocation.latitude,
            longitude: studentLocation.longitude,
            campus: qrPayload.location ? qrPayload.location.campus : student.campus
          } : null
        });
      } else if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime) {
        // Student has already completed attendance cycle for today
        return NextResponse.json({
          success: true,
          message: "You have already completed your attendance for today",
          lastCheckIn: attendanceRecord.checkInTime,
          lastCheckOut: attendanceRecord.checkOutTime,
          lastAction: 'complete'
        });
      } else if (attendanceRecord.lastAction === 'check-in') {
        // Already checked in
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
            campus: qrPayload.location ? qrPayload.location.campus : student.campus
          };
        }
        
        if (attendanceRecord.status === 'half-day') {
          attendanceRecord.status = 'present';
        }
      }
    } else if (qrPayload.type === 'check-out') {
      // Handle check-out
      if (!attendanceRecord || !attendanceRecord.checkInTime) {
        return NextResponse.json({
          success: false,
          message: "You need to check in first"
        }, { status: 400 });
      }
      
      if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime) {
        // Student has already completed attendance cycle for today
        return NextResponse.json({
          success: true,
          message: "You have already completed your attendance for today",
          lastCheckIn: attendanceRecord.checkInTime,
          lastCheckOut: attendanceRecord.checkOutTime,
          lastAction: 'complete'
        });
      }
      
      if (attendanceRecord.lastAction === 'check-out') {
        return NextResponse.json({
          success: true,
          message: "You have already checked out",
          lastCheckIn: attendanceRecord.checkInTime,
          lastCheckOut: attendanceRecord.checkOutTime,
          lastAction: attendanceRecord.lastAction
        });
      }
      
      // Update record with check-out info
      attendanceRecord.checkOutTime = now;
      attendanceRecord.lastAction = 'check-out';
      
      // Update location if provided
      if (studentLocation) {
        attendanceRecord.checkOutLocation = {
          latitude: studentLocation.latitude,
          longitude: studentLocation.longitude,
          campus: qrPayload.location ? qrPayload.location.campus : student.campus
        };
      }
      
      // Calculate duration in minutes
      const checkInTime = new Date(attendanceRecord.checkInTime).getTime();
      const checkOutTime = now.getTime();
      const durationMinutes = Math.round((checkOutTime - checkInTime) / 60000);
      attendanceRecord.duration = durationMinutes;
      
      // Set status based on duration
      if (durationMinutes < 240) { // Less than 4 hours
        attendanceRecord.status = 'half-day';
      } else {
        attendanceRecord.status = 'present';
      }
    }
    
    // Save attendance record
    await attendanceRecord.save();
    
    // Update session
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

// Helper function to calculate distance between two points using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
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
  // [existing implementation]
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