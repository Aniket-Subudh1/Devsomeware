import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import StudentSession from "@/models/StudentSession";
import TestUsers from "@/models/TestUsers";
import Attendance from "@/models/Attendance";
import jwt from "jsonwebtoken";

interface DecodedToken {
  email: string;
  id: string;
}

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    
    const headers = new Headers();
    headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', '0');
    headers.append('Surrogate-Control', 'no-store');
    
    let data;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        return NextResponse.json({
          success: false,
          message: "Empty request body"
        }, { status: 400, headers });
      }
      data = JSON.parse(bodyText);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json({
        success: false,
        message: "Invalid request format"
      }, { status: 400, headers });
    }
    
    const { token, email, deviceId } = data || {};
    
    if (!token || !email || !deviceId) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400, headers });
    }
    
    // Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401, headers });
    }
    
    // Verify email matches token
    if (decoded.email !== email) {
      return NextResponse.json({
        success: false,
        message: "Token email mismatch"
      }, { status: 401, headers });
    }
    
    // Find active session
    const session = await StudentSession.findOne({
      email,
      isActive: true
    });
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "No active session found. Please login again."
      }, { status: 401, headers });
    }
    
    // Verify device ID
    if (session.deviceId !== deviceId) {
      // Add logic to handle device changes after inactivity
      const lastActiveTime = new Date(session.lastActive).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceLastActive = (currentTime - lastActiveTime) / (1000 * 60 * 60);
      
      if (hoursSinceLastActive > 12) {
        // Update the session with the new device ID
        session.deviceId = deviceId;
        session.lastActive = new Date();
        await session.save();
      } else {
        return NextResponse.json({
          success: false,
          message: "Session is bound to a different device. Please use the original device or wait 12 hours."
        }, { status: 403, headers });
      }
    }
   
    const student = await TestUsers.findById(session.studentId).lean();
    
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found"
      }, { status: 404, headers });
    }
   
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    interface AttendanceRecord {
      checkInTime?: Date;
      checkOutTime?: Date;
      lastAction?: string;
    }

    const todayAttendance = await Attendance.findOne<AttendanceRecord>({
      email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 }).lean();
    
    // Update session's last active timestamp
    session.lastActive = new Date();
    await session.save();
    
    return NextResponse.json({
      success: true,
      student,
      lastCheckIn: todayAttendance?.checkInTime || null,
      lastCheckOut: todayAttendance?.checkOutTime || null,
      lastAction: todayAttendance?.lastAction || null
    }, { headers });
  } catch (error) {
    console.error("Error verifying student session:", error);
    
    // Add cache control headers to prevent browser caching
    const headers = new Headers();
    headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', '0');
    headers.append('Surrogate-Control', 'no-store');
    
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500, headers });
  }
}


export async function OPTIONS() {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.append('Pragma', 'no-cache');
  headers.append('Expires', '0');
  headers.append('Surrogate-Control', 'no-store');
  
  return new NextResponse(null, {
    status: 200,
    headers,
  });
}