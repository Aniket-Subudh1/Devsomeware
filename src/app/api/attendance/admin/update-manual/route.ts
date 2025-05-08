import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";
import TestUsers from "@/models/TestUsers";

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    
    const data = await req.json();
    const { adminPassword, record } = data;
    
    // Verify admin credentials
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    // Validate request data
    if (!record || !record.testUserId || !record.email || !record.date) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields in attendance record"
      }, { status: 400 });
    }
    
    // Verify student exists
    const student = await TestUsers.findById(record.testUserId);
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found"
      }, { status: 404 });
    }
    
    // Format date properly
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    
    // Check if we're updating existing record or creating new one
    let attendanceRecord;
    if (record._id) {
      // Update existing record
      attendanceRecord = await Attendance.findById(record._id);
      
      if (!attendanceRecord) {
        return NextResponse.json({
          success: false,
          message: "Attendance record not found"
        }, { status: 404 });
      }
      
      // Update fields
      attendanceRecord.status = record.status;
      attendanceRecord.lastAction = record.lastAction;
      
      if (record.checkInTime) {
        attendanceRecord.checkInTime = new Date(record.checkInTime);
      } else {
        attendanceRecord.checkInTime = undefined;
      }
      
      if (record.checkOutTime) {
        attendanceRecord.checkOutTime = new Date(record.checkOutTime);
      } else {
        attendanceRecord.checkOutTime = undefined;
      }
      
      if (record.duration) {
        attendanceRecord.duration = record.duration;
      } else if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime) {
        // Calculate duration if both times exist
        const checkInTime = attendanceRecord.checkInTime.getTime();
        const checkOutTime = attendanceRecord.checkOutTime.getTime();
        attendanceRecord.duration = Math.round((checkOutTime - checkInTime) / 60000); // minutes
      } else {
        attendanceRecord.duration = undefined;
      }
      
      await attendanceRecord.save();
    } else {
      // Check for existing record on this date
      attendanceRecord = await Attendance.findOne({
        testUserId: record.testUserId, 
        date: { 
          $gte: recordDate,
          $lt: new Date(recordDate.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      if (attendanceRecord) {
        // Update existing record found by date
        attendanceRecord.status = record.status;
        attendanceRecord.lastAction = record.lastAction;
        
        if (record.checkInTime) {
          attendanceRecord.checkInTime = new Date(record.checkInTime);
        } else {
          attendanceRecord.checkInTime = undefined;
        }
        
        if (record.checkOutTime) {
          attendanceRecord.checkOutTime = new Date(record.checkOutTime);
        } else {
          attendanceRecord.checkOutTime = undefined;
        }
        
        if (record.duration) {
          attendanceRecord.duration = record.duration;
        } else if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime) {
          // Calculate duration if both times exist
          const checkInTime = attendanceRecord.checkInTime.getTime();
          const checkOutTime = attendanceRecord.checkOutTime.getTime();
          attendanceRecord.duration = Math.round((checkOutTime - checkInTime) / 60000); // minutes
        } else {
          attendanceRecord.duration = undefined;
        }
        
        await attendanceRecord.save();
      } else {
        // Create new record
        const newRecord: {
          testUserId: any;
          email: any;
          date: Date;
          status: any;
          lastAction: any;
          checkInTime?: Date;
          checkOutTime?: Date;
          duration?: number;
        } = {
          testUserId: record.testUserId,
          email: record.email,
          date: recordDate,
          status: record.status,
          lastAction: record.lastAction || "check-in"
        };
        
        if (record.checkInTime) {
          newRecord.checkInTime = new Date(record.checkInTime);
        }
        
        if (record.checkOutTime) {
          newRecord.checkOutTime = new Date(record.checkOutTime);
        }
        
        if (record.duration) {
          newRecord.duration = record.duration;
        } else if (newRecord.checkInTime && newRecord.checkOutTime) {
          // Calculate duration if both times exist
          const checkInTime = newRecord.checkInTime.getTime();
          const checkOutTime = newRecord.checkOutTime.getTime();
          newRecord.duration = Math.round((checkOutTime - checkInTime) / 60000); // minutes
        }
        
        attendanceRecord = await Attendance.create(newRecord);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Attendance record updated successfully",
      record: attendanceRecord
    });
    
  } catch (error) {
    console.error("Error updating attendance manually:", error);
    return NextResponse.json({
      success: false,
      message: "Error updating attendance record"
    }, { status: 500 });
  }
}
