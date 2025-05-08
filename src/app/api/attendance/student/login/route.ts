import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import TestUsers from "@/models/TestUsers";
import jwt from "jsonwebtoken";
import StudentSession from "@/models/StudentSession";
import Attendance from "@/models/Attendance";

interface ITestUser {
  _id: string;
  name: string;
  email: string;
  regno?: string;
  branch?: string;
  campus?: string;
}

interface IAttendance {
  checkInTime?: Date;
  checkOutTime?: Date;
  lastAction?: 'check-in' | 'check-out';
}

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    const data = await req.json();
    const { email, deviceId } = data;

    if (!email || !deviceId) {
      return NextResponse.json({
        success: false,
        message: "Email and device ID are required"
      }, { status: 400 });
    }
    
    const student = await TestUsers.findOne({ email }).lean() as ITestUser | null;
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found. Please register first."
      }, { status: 404 });
    }
    
    const existingSession = await StudentSession.findOne({ email });
    
    if (existingSession) {
      // Case 1: Same email trying to login again - that's fine
      if (existingSession.deviceId === deviceId) {
        existingSession.lastActive = new Date();
        await existingSession.save();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayAttendance = await Attendance.findOne({
          email,
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }).sort({ createdAt: -1 }).lean() as IAttendance | null;
        
        return NextResponse.json({
          success: true,
          message: "Session already active",
          token: existingSession.token,
          student: {
            name: student.name,
            email: student.email,
            regno: student.regno || "",
            branch: student.branch || "",
            campus: student.campus || ""
          },
          lastCheckIn: todayAttendance?.checkInTime || null,
          lastCheckOut: todayAttendance?.checkOutTime || null,
          lastAction: todayAttendance?.lastAction || null
        });
      } 
      // Case 2: Different device for same email
      else {
        // Check if the old session is inactive (last active more than 12 hours ago)
        const lastActiveTime = new Date(existingSession.lastActive).getTime();
        const currentTime = new Date().getTime();
        const hoursSinceLastActive = (currentTime - lastActiveTime) / (1000 * 60 * 60);
        
        if (hoursSinceLastActive > 12) {
          // Deactivate the old session
          existingSession.isActive = false;
          await existingSession.save();
          
          // Create a new session below (outside this if/else block)
        } else {
          return NextResponse.json({
            success: false,
            message: "You already have an active session on another device. Please use that device or try again after 12 hours."
          }, { status: 403 });
        }
      }
    }
    
    // Create a new session for this student (either first login or after old session expiry)
    const token = jwt.sign(
      { email, id: student._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" } 
    );
    
    const newSession = new StudentSession({
      email,
      studentId: student._id,
      token,
      deviceId,
      isActive: true
    });
    
    await newSession.save();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.findOne({
      email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 }).lean() as IAttendance | null;
    
    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      student: {
        name: student.name,
        email: student.email,
        regno: student.regno || "",
        branch: student.branch || "",
        campus: student.campus || ""
      },
      lastCheckIn: todayAttendance?.checkInTime || null,
      lastCheckOut: todayAttendance?.checkOutTime || null,
      lastAction: todayAttendance?.lastAction || null
    });
  } catch (error) {
    console.error("Error in student login:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}