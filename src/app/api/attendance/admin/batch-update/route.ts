
import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";
import TestUsers from "@/models/TestUsers";

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    
    const data = await req.json();
    const { adminPassword, studentIds, attendanceData } = data;
    
    // Verify admin credentials
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    // Validate request data
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No students specified for batch update"
      }, { status: 400 });
    }
    
    if (!attendanceData || !attendanceData.date || !attendanceData.status) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields in attendance data"
      }, { status: 400 });
    }
    
    // Get list of students
    const students = await TestUsers.find({ _id: { $in: studentIds } }).lean();
    
    if (students.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid students found"
      }, { status: 404 });
    }
    
    // Format date properly
    const recordDate = new Date(attendanceData.date);
    recordDate.setHours(0, 0, 0, 0);
    
    let updateCount = 0;
    const errors = [];
    
    // Process each student
    for (const student of students) {
      try {
        // Check for existing record on this date
        let attendanceRecord = await Attendance.findOne({
          testUserId: student._id, 
          date: { 
            $gte: recordDate,
            $lt: new Date(recordDate.getTime() + 24 * 60 * 60 * 1000)
          }
        });
        
        if (attendanceRecord) {
          // Update existing record
          attendanceRecord.status = attendanceData.status;
          attendanceRecord.lastAction = attendanceData.lastAction || 
            (attendanceData.checkOutTime ? "check-out" : "check-in");
          
          if (attendanceData.checkInTime) {
            attendanceRecord.checkInTime = new Date(attendanceData.checkInTime);
          } else {
            attendanceRecord.checkInTime = undefined;
          }
          
          if (attendanceData.checkOutTime) {
            attendanceRecord.checkOutTime = new Date(attendanceData.checkOutTime);
          } else {
            attendanceRecord.checkOutTime = undefined;
          }
          
          if (attendanceData.duration) {
            attendanceRecord.duration = attendanceData.duration;
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
            testUserId: unknown;
            email: any;
            date: Date;
            status: any;
            lastAction: any;
            checkInTime?: Date;
            checkOutTime?: Date;
            duration?: number;
          } = {
            testUserId: student._id,
            email: student.email,
            date: recordDate,
            status: attendanceData.status,
            lastAction: attendanceData.lastAction || 
              (attendanceData.checkOutTime ? "check-out" : "check-in")
          };
          
          if (attendanceData.checkInTime) {
            newRecord.checkInTime = new Date(attendanceData.checkInTime);
          }
          
          if (attendanceData.checkOutTime) {
            newRecord.checkOutTime = new Date(attendanceData.checkOutTime);
          }
          
          if (attendanceData.duration) {
            newRecord.duration = attendanceData.duration;
          } else if (newRecord.checkInTime && newRecord.checkOutTime) {
            // Calculate duration if both times exist
            const checkInTime = newRecord.checkInTime.getTime();
            const checkOutTime = newRecord.checkOutTime.getTime();
            newRecord.duration = Math.round((checkOutTime - checkInTime) / 60000); // minutes
          }
          
          await Attendance.create(newRecord);
        }
        
        updateCount++;
      } catch (error) {
        console.error(`Error updating attendance for student ${student._id}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Error for student ${student.name} (${student.email}): ${errorMessage}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Batch update completed successfully for ${updateCount} students`,
      updateCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error("Error in batch update:", error);
    return NextResponse.json({
      success: false,
      message: "Error processing batch update"
    }, { status: 500 });
  }
}
