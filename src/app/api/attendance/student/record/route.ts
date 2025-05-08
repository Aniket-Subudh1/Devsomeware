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
    
    // Validate inputs
    if (!token || !qrData || !email || !deviceId || !type) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }
    
    // Parse QR data
    let qrPayload;
    try {
      qrPayload = JSON.parse(qrData);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Invalid QR code format"
      }, { status: 400 });
    }
    
    // Verify QR type
    if (qrPayload.type !== 'check-in' && qrPayload.type !== 'check-out') {
      return NextResponse.json({
        success: false,
        message: "Invalid QR type. Must be 'check-in' or 'check-out'"
      }, { status: 400 });
    }
    
    // Verify QR timestamp (within last 30 seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - qrPayload.timestamp > 30) {
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
    
    // Verify token and get student info
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    } catch (error) {
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
    const student = await TestUsers.findOne({ email }).lean() as { _id: string; [key: string]: any } | null;
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
          lastAction: 'check-in'
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
      
      // Calculate duration in minutes
      const checkInTime = new Date(attendanceRecord.checkInTime).getTime();
      const checkOutTime = now.getTime();
      const durationMinutes = Math.round((checkOutTime - checkInTime) / 60000);
      attendanceRecord.duration = durationMinutes;
    }
    
    // Save attendance record
    await attendanceRecord.save();
    
    // Update session
    await StudentSession.findOneAndUpdate(
      { email, isActive: true },
      {
        lastActive: now,
        $push: {
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
    } catch (error) {
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

// Handle OPTIONS requests for CORS support
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