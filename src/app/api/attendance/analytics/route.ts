import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";
import TestUsers from "@/models/TestUsers";

export async function GET(req: NextRequest) {
  try {
    const adminPassword = req.nextUrl.searchParams.get('password');
    const campusFilter = req.nextUrl.searchParams.get('campus') || 'all';
    const fromDate = req.nextUrl.searchParams.get('from') 
      ? new Date(req.nextUrl.searchParams.get('from') as string) 
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const toDate = req.nextUrl.searchParams.get('to') 
      ? new Date(req.nextUrl.searchParams.get('to') as string) 
      : new Date();
    
   
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
  
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    await ConnectDb();
    
    // Fetching all students
    const filter = campusFilter !== 'all' 
      ? { campus: campusFilter } 
      : {};
    
    const students = await TestUsers.find(filter).lean();
    
    // Fetching attendance records within date range
    const attendanceQuery: any = {
      date: {
        $gte: fromDate,
        $lte: toDate
      }
    };
    
    // Apply campus filter if specified
    if (campusFilter !== 'all') {
      // We need to join with students collection to filter by campus
      const studentIds = students.map(student => student._id);
      attendanceQuery.testUserId = { $in: studentIds };
    }
    
    const attendanceRecords = await Attendance.find(attendanceQuery).lean();
    
    // Get unique class dates to determine total number of classes held
    const uniqueDates = new Set<string>();
    attendanceRecords.forEach(record => {
      const dateStr = new Date(record.date).toISOString().split('T')[0];
      uniqueDates.add(dateStr);
    });
    
    const totalClassDays = uniqueDates.size;
    
    // Calculate student-specific stats
    const studentStats = await Promise.all(students.map(async (student) => {
      const studentRecords = attendanceRecords.filter(
        record => record.testUserId?.toString() === student._id?.toString() ||
                record.email === student.email
      );
      
      // Group by date to avoid counting multiple records for the same day
      const recordsByDate = new Map<string, any>();
      studentRecords.forEach(record => {
        const dateStr = new Date(record.date).toISOString().split('T')[0];
        recordsByDate.set(dateStr, record);
      });
      
      // Count unique dates by status
      const presentCount = Array.from(recordsByDate.values())
        .filter(record => record.status === "present").length;
      
      const partialCount = Array.from(recordsByDate.values())
        .filter(record => record.status === "half-day").length;
      
      // Calculate attendance percentage
      const attendancePercentage = totalClassDays > 0
        ? Math.round(((presentCount + partialCount * 0.5) / totalClassDays) * 100)
        : 0;
      
      return {
        student,
        totalClasses: totalClassDays,
        presentCount,
        partialCount,
        absentCount: totalClassDays - presentCount - partialCount,
        attendancePercentage
      };
    }));
    
    // Calculate campus-wise statistics
    const campusStats: {
      [key: string]: {
        totalStudents: number;
        presentCount: number;
        partialCount: number;
        absentCount: number;
        attendanceRate: number;
      }
    } = {
      bbsr: { totalStudents: 0, presentCount: 0, partialCount: 0, absentCount: 0, attendanceRate: 0 },
      pkd: { totalStudents: 0, presentCount: 0, partialCount: 0, absentCount: 0, attendanceRate: 0 },
      vzm: { totalStudents: 0, presentCount: 0, partialCount: 0, absentCount: 0, attendanceRate: 0 }
    };
    
    // Count students by campus
    studentStats.forEach(stat => {
      const campus = stat.student.campus?.toLowerCase();
      if (campus && campusStats[campus]) {
        campusStats[campus].totalStudents++;
        campusStats[campus].presentCount += stat.presentCount;
        campusStats[campus].partialCount += stat.partialCount;
        campusStats[campus].absentCount += stat.absentCount;
      }
    });
    
    // Calculate attendance rates for each campus
    Object.keys(campusStats).forEach(campus => {
      const stats = campusStats[campus];
      const totalPossibleDays = stats.totalStudents * totalClassDays;
      
      stats.attendanceRate = totalPossibleDays > 0
        ? Math.round(((stats.presentCount + stats.partialCount * 0.5) / totalPossibleDays) * 100)
        : 0;
    });
    
    // Calculate overall attendance metrics
    const totalStudents = students.length;
    const totalPresentDays = studentStats.reduce((sum, stat) => sum + stat.presentCount, 0);
    const totalPartialDays = studentStats.reduce((sum, stat) => sum + stat.partialCount, 0);
    const totalAbsentDays = studentStats.reduce((sum, stat) => sum + stat.absentCount, 0);
    const totalPossibleDays = totalStudents * totalClassDays;
    
    const overallAttendanceRate = totalPossibleDays > 0
      ? Math.round(((totalPresentDays + totalPartialDays * 0.5) / totalPossibleDays) * 100)
      : 0;
    
    // Generate daily attendance statistics for every day in the date range
    const dailyAttendance = [];
    const dateArray = [];
    
    // Generate all dates between fromDate and toDate
    const currentDate = new Date(fromDate);
    
    while (currentDate <= toDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Process attendance for each day
    for (const date of dateArray) {
      const dateStr = date.toISOString().split('T')[0];
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Records for this day
      const dayRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= date && recordDate < nextDay;
      });
      
      // Create map of students who attended this day
      const studentsPresent = new Map();
      const studentsPartial = new Map();
      
      dayRecords.forEach(record => {
        const studentId = record.testUserId?.toString();
        if (!studentId) return;
        
        if (record.status === 'present') {
          studentsPresent.set(studentId, true);
        } else if (record.status === 'half-day') {
          studentsPartial.set(studentId, true);
        }
      });
      
      // Calculate per-campus stats for this day
      const dayCampusStats = {
        bbsr: { totalStudents: 0, presentCount: 0, partialCount: 0, absentCount: 0, attendanceRate: 0 },
        pkd: { totalStudents: 0, presentCount: 0, partialCount: 0, absentCount: 0, attendanceRate: 0 },
        vzm: { totalStudents: 0, presentCount: 0, partialCount: 0, absentCount: 0, attendanceRate: 0 },
      };
      
      // Count students by campus
      students.forEach(student => {
        const campus = student.campus?.toLowerCase() as 'bbsr' | 'pkd' | 'vzm' | undefined;
        const studentId = student._id?.toString();
        
        if (campus && campus in dayCampusStats && studentId) {
          dayCampusStats[campus].totalStudents++;
          
          if (studentsPresent.has(studentId)) {
            dayCampusStats[campus].presentCount++;
          } else if (studentsPartial.has(studentId)) {
            dayCampusStats[campus].partialCount++;
          } else {
            dayCampusStats[campus].absentCount++;
          }
        }
      });
      
      // Calculate attendance rates for each campus for this day
      Object.keys(dayCampusStats).forEach(campus => {
        const stats = dayCampusStats[campus as keyof typeof dayCampusStats];
        
        stats.attendanceRate = stats.totalStudents > 0
          ? Math.round(((stats.presentCount + stats.partialCount * 0.5) / stats.totalStudents) * 100)
          : 0;
      });
      
      // Overall stats for this day
      const dayPresentCount = studentsPresent.size;
      const dayPartialCount = studentsPartial.size;
      const dayAbsentCount = totalStudents - dayPresentCount - dayPartialCount;
      const dayAttendanceRate = totalStudents > 0
        ? Math.round(((dayPresentCount + dayPartialCount * 0.5) / totalStudents) * 100)
        : 0;
      
      dailyAttendance.push({
        date: dateStr,
        totalStudents,
        presentCount: dayPresentCount,
        partialCount: dayPartialCount,
        absentCount: dayAbsentCount,
        attendanceRate: dayAttendanceRate,
        bbsr: dayCampusStats.bbsr,
        pkd: dayCampusStats.pkd,
        vzm: dayCampusStats.vzm
      });
    }
    
    // Sort daily attendance by date
    dailyAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json({
      success: true,
      data: {
        dateRange: {
          from: fromDate,
          to: toDate
        },
        totalClassDays,
        totalStudents,
        totalPresentDays,
        totalPartialDays,
        totalAbsentDays,
        overallAttendanceRate,
        campusStats,
        studentStats,
        dailyAttendance
      }
    });
    
  } catch (error) {
    console.error("Error generating attendance analytics:", error);
    return NextResponse.json({
      success: false,
      message: "Error generating attendance analytics"
    }, { status: 500 });
  }
}