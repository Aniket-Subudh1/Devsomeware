import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";
import TestUsers from "@/models/TestUsers";
import StudentSession from "@/models/StudentSession";

export async function GET(req: NextRequest) {
  try {
    const adminPassword = req.nextUrl.searchParams.get('password');
    
    // Verify admin password
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    await ConnectDb();
    
    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Run queries in parallel for better performance
    const [
      students,
      activeSessions,
      todayAttendance
    ] = await Promise.all([
      // Only fetch needed fields from students
      TestUsers.find({}).select('_id email name').lean(),
      
      // Use countDocuments instead of find().lean() for active sessions
      StudentSession.countDocuments({ isActive: true }),
      
      // Only fetch needed fields from attendance
      Attendance.find({
        date: {
          $gte: today,
          $lt: tomorrow
        }
      })
      .select('email testUserId checkInTime checkOutTime status duration')
      .lean()
    ]);
    
    const totalStudents = students.length;
    
    // Count check-ins and check-outs - fixed to properly count
    const todayCheckins = todayAttendance.filter(record => record.checkInTime).length;
    const todayCheckouts = todayAttendance.filter(record => record.checkOutTime).length;
    
    // Get unique attendees today (students who checked in)
    const uniqueAttendeeEmails = new Set(todayAttendance.map(record => record.email));
    const uniqueAttendeesToday = uniqueAttendeeEmails.size;
    
    // Count students with complete attendance (both check-in and check-out)
    const completeAttendance = todayAttendance.filter(
      record => record.checkInTime && record.checkOutTime
    ).length;
    
    // Calculate attendance rate based on unique attendees who checked in
    const attendanceRate = totalStudents > 0 
      ? Math.round((uniqueAttendeesToday / totalStudents) * 100) 
      : 0;
    
    // Calculate weekly stats more efficiently
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    // Use a more efficient aggregation for weekly stats
    const weeklyStatsAggregation = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: weekStart,
            $lt: tomorrow
          }
        }
      },
      {
        $group: {
          _id: { 
            $dayOfWeek: "$date" // 1 for Sunday, 2 for Monday, etc.
          },
          uniqueAttendees: { 
            $addToSet: "$email" 
          }
        }
      },
      {
        $project: {
          day: "$_id",
          attendance: { $size: "$uniqueAttendees" }
        }
      },
      {
        $sort: { day: 1 }
      }
    ]);
    
    // Format the weekly stats
    const weeklyStats = Array.from({ length: 7 }, (_, i) => ({
      day: new Date(weekStart.getTime() + i * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
      attendance: 0,
      rate: 0
    }));
    
  
    weeklyStatsAggregation.forEach(stat => {
      const index = stat.day - 1;
      if (index >= 0 && index < 7) {
        weeklyStats[index].attendance = stat.attendance;
        weeklyStats[index].rate = totalStudents > 0 
          ? Math.round((stat.attendance / totalStudents) * 100) 
          : 0;
      }
    });
    
    const latestCheckInsWithStudents = await Attendance.aggregate([
      {
        $match: {
          checkInTime: { $exists: true, $ne: null }
        }
      },
      {
        $sort: { checkInTime: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'testusers',
          localField: 'testUserId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: {
          path: '$student',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          checkInTime: 1,
          'student.name': 1,
          'student.regno': 1
        }
      }
    ]);
    
    // Calculate average duration efficiently
    const avgDurationResult = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: tomorrow
          },
          checkInTime: { $exists: true, $ne: null },
          checkOutTime: { $exists: true, $ne: null },
          duration: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" }
        }
      }
    ]);
    
    const avgDuration = avgDurationResult.length > 0 
      ? Math.round(avgDurationResult[0].avgDuration) 
      : 0;
    
    // Prepare stats object with all calculated data
    const stats = {
      todayCheckins,
      todayCheckouts,
      activeSessions,
      totalStudents,
      uniqueAttendees: uniqueAttendeesToday,
      attendanceRate,
      avgDuration,
      weeklyStats,
      completeAttendance,
      latestCheckIns: latestCheckInsWithStudents
    };
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error("Error fetching QR stats:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}