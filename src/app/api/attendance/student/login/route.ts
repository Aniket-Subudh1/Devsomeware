import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import TestUsers from "@/models/TestUsers";
import StudentSession from "@/models/StudentSession";
import Attendance from "@/models/Attendance";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
interface ITestUser {
  _id: string;
  name: string;
  email: string;
  regno?: string;
  branch?: string;
  campus?: string;
  password?: string;
}

interface IAttendance {
  checkInTime?: Date;
  checkOutTime?: Date;
  lastAction?: 'check-in' | 'check-out';
}

interface MongoDBError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    const data = await req.json();
    const { email, deviceId ,password} = data;

    if (!email || !deviceId) {
      return NextResponse.json({
        success: false,
        message: "Email and device ID are required"
      }, { status: 400 });
    }
    let userexists = await TestUsers.findOne({ email }).lean() as ITestUser | null;
    //if user is not exists
    if (!userexists) {
      return NextResponse.json({
        success: false,
        message: "User not found. Please register first. Contact admin if you are facing issues."
      }, { status: 404 });
    }
    //if user is exists
    //check if password is undefined
    if (!userexists?.password) {
        throw new Error("Password is undefined for the user.");
    }
    //decrypt the password
    const decryptpassword = CryptoJS.AES.decrypt(userexists.password, process.env.AES_SECRET || "").toString(CryptoJS.enc.Utf8);
            //if password is incorrect
            if (decryptpassword != password) {
                return NextResponse.json({ message: "Password is incorrect", success: false });
            }
    // First check if this device has been used with ANY other email
    // This allows same email on same device, but prevents different emails on same device
    const existingDeviceSession = await StudentSession.findOne({ deviceId });
    
    if (existingDeviceSession && existingDeviceSession.email !== email) {
      // Log this as suspicious activity
      console.warn(`[SECURITY ALERT] Device reuse attempt: Device ${deviceId} already associated with ${existingDeviceSession.email}, but trying to login as ${email}`);
      
      // Record this attempt in the session's security logs
      await StudentSession.findOneAndUpdate(
        { deviceId },
        {
          $push: {
            securityLogs: {
              event: 'multiple_email_attempt',
              details: `Attempt to use device with email ${email} but already registered to ${existingDeviceSession.email}`,
              timestamp: new Date(),
              deviceId: deviceId
            }
          }
        }
      );
      
      return NextResponse.json({
        success: false,
        message: "This device is already registered to another student. Each student must use their own device."
      }, { status: 403 });
    }
    
    const student = await TestUsers.findOne({ email }).lean() as ITestUser | null;
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found. Please register first."
      }, { status: 404 });
    }
    
    // Check if there's an existing session with special handling for duplicate key errors
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
      
        else {
        
          const lastActiveTime = new Date(existingSession.lastActive).getTime();
          const currentTime = new Date().getTime();
          const hoursSinceLastActive = (currentTime - lastActiveTime) / (1000 * 60 * 60);
          
     
          console.warn(`[SECURITY] User ${email} attempting login from new device. Last active: ${hoursSinceLastActive.toFixed(2)} hours ago.`);
          
          if (hoursSinceLastActive > 12) {
            const token = jwt.sign(
              { email, id: student._id },
              process.env.JWT_SECRET as string,
              { expiresIn: "30d" } 
            );
            
            // Update the existing session
            existingSession.deviceId = deviceId;
            existingSession.token = token;
            existingSession.lastActive = new Date();
            
            // Add security log
            if (!existingSession.securityLogs) {
              existingSession.securityLogs = [];
            }
            
            existingSession.securityLogs.push({
              event: 'device_change',
              details: `Device changed after ${hoursSinceLastActive.toFixed(2)} hours of inactivity`,
              timestamp: new Date(),
              deviceId: deviceId
            });
            
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
        await StudentSession.findOneAndUpdate(
          { email },
          {
            $set: {
              email,
              studentId: student._id,
              token,
              deviceId,
              isActive: true,
              lastActive: new Date(),
              securityLogs: [{
                event: 'initial_login',
                details: 'New session created',
                timestamp: new Date(),
                deviceId: deviceId
              }]
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
      } catch (error) {
        // Type guard for MongoDB errors
        const sessionError = error as MongoDBError;
        
        // If we still get a duplicate key error despite our precautions, try again with a direct approach
        if (sessionError.code === 11000) {
          // Fetch the existing session again (it might have been created in a race condition)
          const retrySession = await StudentSession.findOne({ email });
          
          if (retrySession) {
            // Update the session
            retrySession.deviceId = deviceId;
            retrySession.token = token;
            retrySession.lastActive = new Date();
            
            // Add security log
            if (!retrySession.securityLogs) {
              retrySession.securityLogs = [];
            }
            
            retrySession.securityLogs.push({
              event: 'retry_login',
              details: 'Retry login after duplicate key error',
              timestamp: new Date(),
              deviceId: deviceId
            });
            
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
      // Type guard for MongoDB errors
      const mongoError = error as MongoDBError;
      
      // For any other errors, we'll try a last-resort approach
      if (mongoError.code === 11000) {
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
            lastActive: new Date(),
            securityLogs: [{
              event: 'recreate_session',
              details: 'Session recreated after deletion',
              timestamp: new Date(),
              deviceId: deviceId
            }]
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