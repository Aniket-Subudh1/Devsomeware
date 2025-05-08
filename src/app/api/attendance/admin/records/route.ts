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
    const campus = req.nextUrl.searchParams.get('campus');
    
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    await ConnectDb();
    
    const filter: {
      date?: { $gte?: Date, $lte?: Date },
      testUserId?: string | { $in: string[] },
      status?: string,
      'student.campus'?: string
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
      name: string;
      email: string;
      regno?: string;
      branch?: string;
      campus?: string;
      [key: string]: unknown;
    }
    
    // Get all students
    const students = (await TestUsers.find({}).lean()).map(user => ({
      name: user.name || "",
      email: user.email || "",
      regno: user.regno,
      branch: user.branch,
      campus: user.campus,
      ...user
    })) as Student[];
    
    const filteredStudentIds = campus && campus !== 'all' 
      ? students
          .filter(s => s.campus?.toLowerCase() === campus.toLowerCase())
          .map(s => s._id.toString())
      : null;
    
    if (filteredStudentIds && filteredStudentIds.length > 0) {
      filter.testUserId = { $in: filteredStudentIds };
    }
    
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
    
    const uniqueStudentIdsToday = new Set(todayRecords.map(r => r.testUserId.toString()));
    const presentToday = uniqueStudentIdsToday.size;
    
    const partialToday = todayRecords.filter(r => 
      r.checkInTime && (!r.checkOutTime || r.status === 'half-day')
    ).length;
    
    const checkInsToday = todayRecords.filter(r => r.checkInTime).length;
    const checkOutsToday = todayRecords.filter(r => r.checkOutTime).length;
    
    const campusStats = {
      bbsr: { totalStudents: 0, presentToday: 0, absentToday: 0, partialToday: 0, attendanceRate: 0 },
      pkd: { totalStudents: 0, presentToday: 0, absentToday: 0, partialToday: 0, attendanceRate: 0 },
      vzm: { totalStudents: 0, presentToday: 0, absentToday: 0, partialToday: 0, attendanceRate: 0 }
    };
    
    students.forEach(student => {
      const campus = student.campus?.toLowerCase() || "";
      if (campus === "bbsr" || campus === "pkd" || campus === "vzm") {
        campusStats[campus as keyof typeof campusStats].totalStudents += 1;
      }
    });
    
    // Process today's attendance by campus
    const campusAttendanceMap = new Map<string, Set<string>>();
    const campusPartialMap = new Map<string, Set<string>>();
    
    // Initialize sets for each campus
    ["bbsr", "pkd", "vzm"].forEach(campus => {
      campusAttendanceMap.set(campus, new Set<string>());
      campusPartialMap.set(campus, new Set<string>());
    });
    
    // Categorize today's attendance by campus
    todayRecords.forEach(record => {
      const student = students.find(s => s._id.toString() === record.testUserId.toString());
      if (student) {
        const campus = student.campus?.toLowerCase() || "";
        if (campus === "bbsr" || campus === "pkd" || campus === "vzm") {
          // Mark student as present
          if (record.checkInTime) {
            campusAttendanceMap.get(campus)?.add(record.testUserId.toString());
          }
          
          // Mark as partial if checked in but not out or status is half-day
          if (record.checkInTime && (!record.checkOutTime || record.status === 'half-day')) {
            campusPartialMap.get(campus)?.add(record.testUserId.toString());
          }
        }
      }
    });
    
    // Update campus stats
    ["bbsr", "pkd", "vzm"].forEach(campus => {
      const presentStudents = campusAttendanceMap.get(campus)?.size || 0;
      const partialStudents = campusPartialMap.get(campus)?.size || 0;
      
      campusStats[campus as keyof typeof campusStats].presentToday = presentStudents;
      campusStats[campus as keyof typeof campusStats].partialToday = partialStudents;
      
      // Calculate absent students
      campusStats[campus as keyof typeof campusStats].absentToday = 
        Math.max(0, campusStats[campus as keyof typeof campusStats].totalStudents - presentStudents);
      
      // Calculate attendance rate
      if (campusStats[campus as keyof typeof campusStats].totalStudents > 0) {
        campusStats[campus as keyof typeof campusStats].attendanceRate = Math.round(
          ((presentStudents - partialStudents + (partialStudents * 0.5)) / 
          campusStats[campus as keyof typeof campusStats].totalStudents) * 100
        );
      }
    });
    
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
      
      // Count unique students who checked in
      const uniqueStudentIds = new Set(dayRecords.map(r => r.testUserId.toString()));
      const presentCount = uniqueStudentIds.size;
      
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
      
      // Count unique students for each day
      const uniqueStudentIds = new Set(dayRecords.map(r => r.testUserId.toString()));
      const uniqueFullAttendance = new Set(dayRecords
        .filter(r => r.checkInTime && r.checkOutTime)
        .map(r => r.testUserId.toString()));
      const uniquePartialAttendance = new Set(dayRecords
        .filter(r => r.checkInTime && !r.checkOutTime)
        .map(r => r.testUserId.toString()));
      
      const presentCount = uniqueFullAttendance.size;
      const partialCount = uniquePartialAttendance.size;
      const absentCount = Math.max(0, students.length - (presentCount + partialCount));
      
      presentData.push(presentCount);
      partialData.push(partialCount);
      absentData.push(absentCount);
    }
    
    // Calculate average duration only for records that have both check-in and check-out
    const recordsWithDuration = todayRecords.filter(r => r.duration && r.checkInTime && r.checkOutTime);
    const avgDuration = recordsWithDuration.length > 0 
      ? recordsWithDuration.reduce((sum, r) => sum + (r.duration || 0), 0) / recordsWithDuration.length 
      : 0;
    
    const stats = {
      totalStudents: students.length,
      presentToday,
      absentToday: Math.max(0, students.length - presentToday),
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
      campusStats,
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