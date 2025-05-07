import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";
import TestUsers from "@/models/TestUsers";
import StudentSession from "@/models/StudentSession";

export async function GET(req: NextRequest) {
  try {
    const adminPassword = req.nextUrl.searchParams.get('password');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');
    const studentId = req.nextUrl.searchParams.get('studentId');
    const status = req.nextUrl.searchParams.get('status');
    
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    await ConnectDb();
    
    const filter: {
      date?: { $gte?: Date, $lte?: Date },
      testUserId?: string,
      status?: string
    } = {};
    
    if (startDate) {
      const parsedStartDate = new Date(startDate);
      parsedStartDate.setHours(0, 0, 0, 0);
      filter.date = { $gte: parsedStartDate };
    }
    
    if (endDate) {
      const parsedEndDate = new Date(endDate);
      parsedEndDate.setHours(23, 59, 59, 999);
      
      if (filter.date) {
        filter.date.$lte = parsedEndDate;
      } else {
        filter.date = { $lte: parsedEndDate };
      }
    }
    
    if (studentId) {
      filter.testUserId = studentId;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Get all students
    interface Student {
      _id: string | { toString(): string };
      [key: string]: unknown;
    }
    
    const students = await TestUsers.find({}).lean() as Student[];
    
    const attendanceRecords = await Attendance.find(filter).sort({ date: -1 }).lean();
    
    const populatedRecords = await Promise.all(attendanceRecords.map(async (record) => {
      const student = students.find(s => s._id.toString() === record.testUserId.toString());
      return {
        ...record,
        student
      };
    }));
    
    const activeSessions = await StudentSession.find({ isActive: true }).lean();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayRecords = attendanceRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= today && recordDate < tomorrow;
    });
    
    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    const partialToday = todayRecords.filter(r => r.status === 'half-day').length;
    const checkInsToday = todayRecords.filter(r => r.lastAction === 'check-in').length;
    const checkOutsToday = todayRecords.filter(r => r.lastAction === 'check-out').length;
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); 
    
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      const dayRecords = attendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= day && recordDate < nextDay;
      });
      
      const presentCount = dayRecords.filter(r => r.status === 'present').length;
      weeklyData.push(presentCount);
    }
    
   
    const monthLabels = [];
    const presentData = [];
    const absentData = [];
    const partialData = [];
    
    for (let i = 29; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      monthLabels.push(day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      const dayRecords = attendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= day && recordDate < nextDay;
      });
      
      const presentCount = dayRecords.filter(r => r.status === 'present').length;
      const partialCount = dayRecords.filter(r => r.status === 'half-day').length;
      const absentCount = students.length - (presentCount + partialCount);
      
      presentData.push(presentCount);
      partialData.push(partialCount);
      absentData.push(Math.max(0, absentCount)); 
    }
    
    const recordsWithDuration = todayRecords.filter(r => r.duration);
    const avgDuration = recordsWithDuration.length > 0 
      ? recordsWithDuration.reduce((sum, r) => sum + (r.duration || 0), 0) / recordsWithDuration.length 
      : 0;
    
    const stats = {
      totalStudents: students.length,
      presentToday,
      absentToday: students.length - (presentToday + partialToday),
      partialToday,
      checkInsToday,
      checkOutsToday,
      avgDuration,
      weeklyAttendance: weeklyData,
      monthlyAttendance: {
        labels: monthLabels,
        present: presentData,
        absent: absentData,
        partial: partialData
      },
      activeSessions: activeSessions.length
    };
    
    return NextResponse.json({
      success: true,
      records: populatedRecords,
      students,
      stats
    });
    
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching attendance records"
    }, { status: 500 });
  }
}