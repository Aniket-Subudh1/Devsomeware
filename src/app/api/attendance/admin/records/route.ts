import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";
import TestUsers from "@/models/TestUsers";
import StudentSession from "@/models/StudentSession";
import jwt from "jsonwebtoken";

interface DecodedToken {
  email: string;
  id: string;
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
    
    const { token, qrData, email, deviceId, type } = data || {};
    
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
    
    // Check if QR code has a timestamp and validate it was generated very recently
    const qrTimestamp = qrPayload.timestamp || 0;
    const expiresAt = qrPayload.expiresAt || (qrTimestamp + 10); // Default to 10 seconds if no expiresAt
    
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
    const student = await TestUsers.findOne({ email }).lean() as { _id: string; [key: string]: any } | null;
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
          lastAction: 'check-in'
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
        // Update existing record with new check-in (after a check-out)attendanceRecord.checkInTime = now;
        attendanceRecord.lastAction = 'check-in';
        
      
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
              action: qrPayload.type
            } : {
              nonce: "legacy-" + Date.now(),
              timestamp: now,
              action: qrPayload.type
            },
            attendanceHistory: {
              date: today,
              checkInTime: attendanceRecord.checkInTime,
              checkOutTime: attendanceRecord.checkOutTime,
              duration: attendanceRecord.duration,
              status: attendanceRecord.status
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

// Add a helper verify endpoint
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    const email = req.nextUrl.searchParams.get('email');
    const deviceId = req.nextUrl.searchParams.get('deviceId');
    
    if (!token || !email || !deviceId) {
      return NextResponse.json({
        success: false,
        message: "Missing required parameters"
      }, { status: 400 });
    }
    
    await ConnectDb();
    
    // Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    } catch  {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 });
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
    
    // Get student info
    const student = await TestUsers.findById(decoded.id).lean();
    
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found"
      }, { status: 404 });
    }
    
    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceRecord = await Attendance.findOne({
      email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({
      success: true,
      student,
      lastCheckIn: Array.isArray(attendanceRecord) ? null : attendanceRecord?.checkInTime || null,
      lastCheckOut: Array.isArray(attendanceRecord) ? null : attendanceRecord?.checkOutTime || null,
      lastAction: Array.isArray(attendanceRecord) ? null : attendanceRecord?.lastAction || null
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
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