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
    
    // Get all students
    const students = await TestUsers.find({}).lean();
    const totalStudents = students.length;
    
    // Get active sessions
    const activeSessions = await StudentSession.find({ isActive: true }).lean();
    
    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's check-ins and check-outs
    const todayAttendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).lean();
    
    // Count check-ins and check-outs
    const todayCheckins = todayAttendance.filter(record => record.lastAction === 'check-in').length;
    const todayCheckouts = todayAttendance.filter(record => record.lastAction === 'check-out').length;
    
    // Get unique attendees today (students who checked in)
    const uniqueAttendeesToday = new Set(todayAttendance.map(record => record.email)).size;
    
    // Calculate attendance rate
    const attendanceRate = totalStudents > 0 
      ? Math.round((uniqueAttendeesToday / totalStudents) * 100) 
      : 0;
    
    // Calculate stats for this week
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const weeklyAttendance = await Attendance.find({
      date: {
        $gte: weekStart,
        $lt: tomorrow
      }
    }).lean();
    
    // Get unique attendees per day this week
    const weeklyStats = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      const dayAttendance = weeklyAttendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= day && recordDate < nextDay;
      });
      
      const uniqueAttendees = new Set(dayAttendance.map(record => record.email)).size;
      
      weeklyStats.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        attendance: uniqueAttendees,
        rate: totalStudents > 0 ? Math.round((uniqueAttendees / totalStudents) * 100) : 0
      });
    }
    
    // Get latest check-ins
    const latestCheckIns = await Attendance.find({
      lastAction: 'check-in'
    })
    .sort({ checkInTime: -1 })
    .limit(5)
    .lean();
    
    // Join with student data
    const latestCheckInsWithStudents = await Promise.all(
      latestCheckIns.map(async (record) => {
        const student = await TestUsers.findById(record.testUserId).lean();
        return {
          ...record,
          student: student || { name: 'Unknown Student' }
        };
      })
    );
    
    // Calculate average duration of attendance
    const recordsWithDuration = todayAttendance.filter(record => record.duration);
    const avgDuration = recordsWithDuration.length > 0
      ? Math.round(recordsWithDuration.reduce((sum, record) => sum + (record.duration || 0), 0) / recordsWithDuration.length)
      : 0;
    
    // In your API route
const stats = {
    todayCheckins: todayAttendance.filter(record => record.lastAction === 'check-in').length || 0,
    todayCheckouts: todayAttendance.filter(record => record.lastAction === 'check-out').length || 0,
    activeSessions: activeSessions.length || 0,
    totalStudents: students.length || 0,
    uniqueAttendees: uniqueAttendeesToday || 0,
    attendanceRate: students.length > 0 
      ? Math.round((uniqueAttendeesToday / students.length) * 100) 
      : 0,
    weeklyStats: weeklyStats || [],
    latestCheckIns: latestCheckInsWithStudents || [],
    avgDuration: avgDuration || 0
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