import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import StudentSession from "@/models/StudentSession";
import TestUsers from "@/models/TestUsers";
import Attendance from "@/models/Attendance";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    const data = await req.json();
    const { token, email, deviceId } = data;
    
    if (!token || !email || !deviceId) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
        id: string;
      };
    } catch {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 });
    }
    
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
    
    // Fetch student info
    const student = await TestUsers.findById(session.studentId).lean();
    
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found"
      }, { status: 404 });
    }
    
    // Get attendance info for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.findOne({
      email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 }).lean() as {
      checkInTime?: Date;
      checkOutTime?: Date;
      lastAction?: string;
    } | null;
    
    // Update session's last active timestamp
    session.lastActive = new Date();
    await session.save();
    
    return NextResponse.json({
      success: true,
      student,
      lastCheckIn: todayAttendance?.checkInTime || null,
      lastCheckOut: todayAttendance?.checkOutTime || null,
      lastAction: todayAttendance?.lastAction || null
    });
  } catch (error) {
    console.error("Error verifying student session:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}