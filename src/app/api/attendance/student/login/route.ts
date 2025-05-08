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
    
    try {
      const existingSession = await StudentSession.findOne({ email });
      
      if (existingSession) {
        // Case 1: Same email trying to login again with the same device - that's fine
        if (existingSession.deviceId === deviceId) {
          // Update last active timestamp
          existingSession.lastActive = new Date();
          await existingSession.save();
          
          // Get today's attendance information
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
            // Instead of creating a new session later, update the current one
            // Generate a new token
            const token = jwt.sign(
              { email, id: student._id },
              process.env.JWT_SECRET as string,
              { expiresIn: "30d" } 
            );
            
            // Update the existing session
            existingSession.deviceId = deviceId;
            existingSession.token = token;
            existingSession.lastActive = new Date();
            await existingSession.save();
            
            // Get today's attendance info
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
              message: "Session updated with new device",
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
          } else {
            return NextResponse.json({
              success: false,
              message: "You already have an active session on another device. Please use that device or try again after 12 hours."
            }, { status: 403 });
          }
        }
      }
      
      // No existing session - create a new one
      // Generate a new token
      const token = jwt.sign(
        { email, id: student._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" } 
      );
      
      try {
        // Create new session with findOneAndUpdate to avoid race conditions and duplicate key errors
        const newSession = await StudentSession.findOneAndUpdate(
          { email },
          {
            $set: {
              email,
              studentId: student._id,
              token,
              deviceId,
              isActive: true,
              lastActive: new Date()
            }
          },
          { upsert: true, new: true }
        );
        
        // Get today's attendance info
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
      } catch (sessionError) {
        if (sessionError.code === 11000) {
          const retrySession = await StudentSession.findOne({ email });
          
          if (retrySession) {
            // Update the session
            retrySession.deviceId = deviceId;
            retrySession.token = token;
            retrySession.lastActive = new Date();
            await retrySession.save();
            
            // Get today's attendance info
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
              message: "Login successful (retry)",
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
          } else {
            throw new Error("Failed to create or update session after retry");
          }
        } else {
          throw sessionError;
        }
      }
    } catch (error) {
      console.error("Session handling error:", error);
      // For any other errors, we'll try a last-resort approach
      if (error.code === 11000) {
        try {
          // Try to delete the existing session and create a new one
          await StudentSession.deleteOne({ email });
          
          // Generate a new token
          const token = jwt.sign(
            { email, id: student._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "30d" } 
          );
          
          // Create new session
          const newSession = new StudentSession({
            email,
            studentId: student._id,
            token,
            deviceId,
            isActive: true,
            lastActive: new Date()
          });
          
          await newSession.save();
          
          // Get today's attendance info
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
            message: "Login successful (recreated session)",
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
        } catch (finalError) {
          console.error("Final error handling attempt failed:", finalError);
          return NextResponse.json({
            success: false,
            message: "Session error. Please try again later."
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({
        success: false,
        message: "Internal server error during session creation"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in student login:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}