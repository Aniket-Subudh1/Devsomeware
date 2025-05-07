import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import StudentSession from "@/models/StudentSession";
import Attendance from "@/models/Attendance";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    const data = await req.json();
    const { token, qrData, email, deviceId, type } = data;
    
    // Validate inputs
    if (!token || !qrData || !email || !deviceId || !type) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }
    
    // Verify token and session
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
        id: string;
      };
    } catch  {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 });
    }
    
    // Verify session is active and for the right device
    const session = await StudentSession.findOne({
      email: decoded.email,
      isActive: true
    });
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "No active session found"
      }, { status: 401 });
    }
    
    if (session.deviceId !== deviceId) {
      return NextResponse.json({
        success: false,
        message: "Session is bound to a different device"
      }, { status: 403 });
    }
    
    // Update last active timestamp
    session.lastActive = new Date();
    await session.save();
    
    // Parse QR data
    let qrPayload;
    try {
      qrPayload = JSON.parse(qrData);
    } catch  {
      return NextResponse.json({
        success: false,
        message: "Invalid QR code format"
      }, { status: 400 });
    }
    
    // Verify QR type and timestamp
    if (qrPayload.type !== type) {
      return NextResponse.json({
        success: false,
        message: `This QR code is for ${qrPayload.type}, not ${type}`
      }, { status: 400 });
    }
    
    // Verify the QR code is recent (within last 5 seconds to allow scanning time)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - qrPayload.timestamp > 5) {
      return NextResponse.json({
        success: false,
        message: "QR code has expired. Please scan a fresh code."
      }, { status: 400 });
    }
    
    // Verify the admin signature if provided
    const expectedSignature = process.env.NEXT_PUBLIC_ADMIN_SIGNATURE || 'default-signature';
    if (qrPayload.adminSignature !== expectedSignature) {
      return NextResponse.json({
        success: false,
        message: "Invalid QR code signature"
      }, { status: 401 });
    }
    
    // Get the current date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (type === 'check-in') {
      // Check if already checked in for today
      const existingAttendance = await Attendance.findOne({
        email,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        },
        checkInTime: { $exists: true }
      });
      
      if (existingAttendance) {
        return NextResponse.json({
          success: false,
          message: "You have already checked in for today"
        }, { status: 400 });
      }
      
      // Record check-in
      const newAttendance = new Attendance({
        email,
        testUserId: decoded.id,
        date: today,
        checkInTime: new Date(),
        status: 'present',
        lastAction: 'check-in'
      });
      
      await newAttendance.save();
      
      return NextResponse.json({
        success: true,
        message: "Check-in recorded successfully",
        checkInTime: newAttendance.checkInTime
      });
    } else if (type === 'check-out') {
      // Find attendance record for today
      const attendanceRecord = await Attendance.findOne({
        email,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      if (!attendanceRecord) {
        return NextResponse.json({
          success: false,
          message: "You need to check in before checking out"
        }, { status: 400 });
      }
      
      if (attendanceRecord.checkOutTime) {
        return NextResponse.json({
          success: false,
          message: "You have already checked out for today"
        }, { status: 400 });
      }
      
      // Record check-out
      const checkOutTime = new Date();
      const durationInMinutes = Math.floor(
        (checkOutTime.getTime() - attendanceRecord.checkInTime.getTime()) / (1000 * 60)
      );
      
      attendanceRecord.checkOutTime = checkOutTime;
      attendanceRecord.duration = durationInMinutes;
      attendanceRecord.lastAction = 'check-out';
      
      // Update status based on duration
      if (durationInMinutes < 240) { // Less than 4 hours
        attendanceRecord.status = 'half-day';
      }
      
      await attendanceRecord.save();
      
      return NextResponse.json({
        success: true,
        message: "Check-out recorded successfully",
        checkOutTime: attendanceRecord.checkOutTime,
        duration: durationInMinutes
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Invalid action type. Must be 'check-in' or 'check-out'"
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}