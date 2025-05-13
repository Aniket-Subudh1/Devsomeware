import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";
import TestUsers from "@/models/TestUsers";
import StudentSession from "@/models/StudentSession";
import jwt from "jsonwebtoken";

interface DecodedToken {
  email: string;
  id: string;
}

// Handle POST requests for QR code attendance recording
export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    
    let data;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        return NextResponse.json({
          success: false,
          message: "Empty request body"
        }, { status: 400 });
      }
      data = JSON.parse(bodyText);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json({
        success: false,
        message: "Invalid request format"
      }, { status: 400 });
    }
    
    const { token, qrData, email, deviceId, type } = data || {};
    
    if (!token || !qrData || !email || !deviceId || !type) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }
    
    let qrPayload;
    try {
      qrPayload = JSON.parse(qrData);
    } catch  {
      return NextResponse.json({
        success: false,
        message: "Invalid QR code format"
      }, { status: 400 });
    }
    
    if (qrPayload.type !== 'check-in' && qrPayload.type !== 'check-out') {
      return NextResponse.json({
        success: false,
        message: "Invalid QR type. Must be 'check-in' or 'check-out'"
      }, { status: 400 });
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if QR code has a timestamp and validate it was generated very recently
    const qrTimestamp = qrPayload.timestamp || 0;
    const expiresAt = qrPayload.expiresAt || (qrTimestamp + 10); // Default to 10 seconds if no expiresAt
    
    // Ensure QR code is not expired
    if (currentTime > expiresAt) {
      return NextResponse.json({
        success: false,
        message: "QR code has expired. Please scan a fresh code."
      }, { status: 400 });
    }
    
    // Verify signature if needed
    const adminSignature = process.env.NEXT_PUBLIC_ADMIN_SIGNATURE || 'default-signature';
    if (qrPayload.adminSignature !== adminSignature) {
      // Log potential security breach
      console.warn(`[SECURITY] Invalid QR signature attempt from ${email} with deviceId ${deviceId}`);
      
      return NextResponse.json({
        success: false,
        message: "Invalid QR code signature"
      }, { status: 400 });
    }
    
    // Verify token and get student info
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    } catch  {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 });
    }
    
 
    if (decoded.email !== email) {
     
      console.warn(`[SECURITY] Token email mismatch: token ${decoded.email} vs request ${email}`);
      
      return NextResponse.json({
        success: false,
        message: "Token email mismatch"
      }, { status: 401 });
    }
    
    // Check if student exists
    const student = await TestUsers.findOne({ email }).lean() as { _id: string; [key: string]: any } | null;
    if (!student) {
      return NextResponse.json({
        success: false,
        message: "Student not found"
      }, { status: 404 });
    }
    
    // Verify session and device match
    const session = await StudentSession.findOne({
      email,
      isActive: true,
    }).lean();
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: "No active session found"
      }, { status: 401 });
    }

    if (Array.isArray(session) || !session.deviceId) {
      return NextResponse.json({
        success: false,
        message: "Session data is invalid"
      }, { status: 500 });
    }
    
 
    if (session.deviceId !== deviceId) {
    
      console.warn(`[SECURITY] Device mismatch for ${email}: session ${session.deviceId} vs request ${deviceId}`);
      
      return NextResponse.json({
        success: false,
        message: "This session is bound to a different device. Please use the original device."
      }, { status: 403 });
    }
    
    // Check if this nonce has been used before (to prevent QR code reuse)
    if (qrPayload.nonce) {
      const existingNonceRecord = await StudentSession.findOne({
        'scanHistory.nonce': qrPayload.nonce
      });
      
      if (existingNonceRecord) {
        return NextResponse.json({
          success: false,
          message: "This QR code has already been used. Please scan a fresh code."
        }, { status: 400 });
      }
    }
    
    // Determine the current date (reset to start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Look for existing attendance record for today
    let attendanceRecord = await Attendance.findOne({
      email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 });
    
    const now = new Date();
    
    if (attendanceRecord) {
      const lastActionTime = attendanceRecord.lastAction === 'check-in' 
        ? attendanceRecord.checkInTime 
        : attendanceRecord.checkOutTime;
        
      if (lastActionTime) {
        const timeSinceLastAction = now.getTime() - new Date(lastActionTime).getTime();
     
        if (timeSinceLastAction < 10000) {
          return NextResponse.json({
            success: false,
            message: "Please wait before scanning again"
          }, { status: 429 }); 
        }
      }
    }
    
    if (qrPayload.type === 'check-in') {
  
      if (!attendanceRecord) {
      
        attendanceRecord = new Attendance({
          email,
          testUserId: student._id,
          date: today,
          checkInTime: now,
          status: 'present',
          lastAction: 'check-in'
        });
      } else if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime) {
 
        return NextResponse.json({
          success: true,
          message: "You have already completed your attendance for today",
          lastCheckIn: attendanceRecord.checkInTime,
          lastCheckOut: attendanceRecord.checkOutTime,
          lastAction: 'complete'
        });
      } else if (attendanceRecord.lastAction === 'check-in') {
      
        return NextResponse.json({
          success: true,
          message: "You are already checked in",
          lastCheckIn: attendanceRecord.checkInTime,
          lastCheckOut: attendanceRecord.checkOutTime,
          lastAction: attendanceRecord.lastAction
        });
      } else {
        // Update existing record with new check-in (after a check-out)attendanceRecord.checkInTime = now;
        attendanceRecord.lastAction = 'check-in';
        
      
        if (attendanceRecord.status === 'half-day') {
          attendanceRecord.status = 'present';
        }
      }
    } else if (qrPayload.type === 'check-out') {

  if (!attendanceRecord || !attendanceRecord.checkInTime) {
    return NextResponse.json({
      success: false,
      message: "You need to check in first"
    }, { status: 400 });
  }
  

  if (attendanceRecord.checkInTime && attendanceRecord.checkOutTime && attendanceRecord.lastAction === 'check-out') {
    return NextResponse.json({
      success: true,
      message: "You have already completed your attendance for today",
      lastCheckIn: attendanceRecord.checkInTime,
      lastCheckOut: attendanceRecord.checkOutTime,
      lastAction: 'complete'
    });
  }
  
 
  attendanceRecord.checkOutTime = now;
  attendanceRecord.lastAction = 'check-out';
  

  const checkInTime = new Date(attendanceRecord.checkInTime).getTime();
  const checkOutTime = now.getTime();
  const durationMinutes = Math.round((checkOutTime - checkInTime) / 60000);
  attendanceRecord.duration = durationMinutes;
  
  
  if (durationMinutes < 240) { 
    attendanceRecord.status = 'half-day';
  } else {
    attendanceRecord.status = 'present';
  }
}
    
    try {
      // Save attendance record
      await attendanceRecord.save();
      
      // Update session with nonce to prevent reuse and add to attendance history
      await StudentSession.findOneAndUpdate(
        { email, isActive: true },
        {
          lastActive: now,
          $push: {
            scanHistory: qrPayload.nonce ? {
              nonce: qrPayload.nonce,
              timestamp: now,
              action: qrPayload.type
            } : {
              nonce: "legacy-" + Date.now(),
              timestamp: now,
              action: qrPayload.type
            },
            attendanceHistory: {
              date: today,
              checkInTime: attendanceRecord.checkInTime,
              checkOutTime: attendanceRecord.checkOutTime,
              duration: attendanceRecord.duration,
              status: attendanceRecord.status
            }
          },
          $inc: { totalAttendance: qrPayload.type === 'check-out' ? 1 : 0 }
        }
      );
    } catch (error) {
      console.error("Error saving attendance record:", error);
      return NextResponse.json({
        success: false,
        message: "Failed to save attendance record"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `${qrPayload.type === 'check-in' ? 'Check-in' : 'Check-out'} recorded successfully`,
      lastCheckIn: attendanceRecord.checkInTime,
      lastCheckOut: attendanceRecord.checkOutTime,
      lastAction: attendanceRecord.lastAction
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}

// GET method - This is the method used by the dashboard
export async function GET(req: NextRequest) {
  try {
    // Check for authentication
    const adminPassword = req.nextUrl.searchParams.get('password');
    
    // Verify admin credentials
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    await ConnectDb();
    
    // Get all students
    const students = await TestUsers.find({}).lean() as unknown as Array<{ _id: string; email: string; campus?: string; [key: string]: unknown }>;
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all attendance records 
    // For performance in a production environment, you might want to limit this
    // to a specific date range or add pagination
    const attendanceRecords = await Attendance.find({}).sort({ date: -1 }).lean();
    
    // Define the type for attendance records
    interface AttendanceRecord {
      _id: string;
      testUserId?: string;
      email: string;
      date: Date;
      checkInTime?: Date;
      checkOutTime?: Date;
      status: string;
      lastAction: string;
      duration?: number;
      [key: string]: unknown;
    }

    // Map student info to attendance records
    const recordsWithStudents = (attendanceRecords as unknown as AttendanceRecord[]).map((record) => {
      const student = students.find(s => 
        (s._id ? s._id.toString() : '') === (record.testUserId ? record.testUserId.toString() : '') || 
        s.email === record.email
      );
      
      return {
        ...record,
        student: student || null
      };
    });
    
    // Get today's check-ins and check-outs
    const todayAttendance = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= today && recordDate < tomorrow;
    });
    
    const todayCheckins = todayAttendance.filter(record => record.checkInTime).length;
    const todayCheckouts = todayAttendance.filter(record => record.checkOutTime).length;
    
    // Get unique attendees today (students who checked in)
    const uniqueAttendeeEmails = new Set(todayAttendance.map(record => record.email));
    const uniqueAttendeesToday = uniqueAttendeeEmails.size;
    
    // Count present and partial students
    const presentToday = todayAttendance.filter(r => r.status === 'present').length;
    const partialToday = todayAttendance.filter(r => r.status === 'half-day').length;
    
    // Calculate absent students
    const presentStudentEmails = new Set(
      todayAttendance.filter(record => record.checkInTime)
        .map(record => record.email)
    );
    
    const absentStudents = students.filter(
      student => !presentStudentEmails.has(student.email)
    );
    
    // Count students with complete attendance
    const completeAttendance = todayAttendance.filter(
      record => record.checkInTime && record.checkOutTime
    ).length;
    
    // Calculate attendance rate
    const attendanceRate = students.length > 0 
      ? Math.round(((presentToday + partialToday * 0.5) / students.length) * 100) 
      : 0;
    
    // Get active sessions
    const activeSessions = await StudentSession.find({ isActive: true }).lean();
    
    // Calculate average duration (for records with duration)
    const recordsWithDuration = todayAttendance.filter(record => 
      record.checkInTime && record.checkOutTime && record.duration
    );
    
    const avgDuration = recordsWithDuration.length > 0
      ? Math.round(recordsWithDuration.reduce((sum, record) => sum + (record.duration || 0), 0) / recordsWithDuration.length)
      : 0;
    
    // Calculate weekly stats
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const weeklyAttendance: number[] = [];
    for (let i = 0; i < 7; i++) {
      weeklyAttendance.push(0); // Initialize with zeros
    }
    
    // Fill in weekly stats
    attendanceRecords.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate >= weekStart && recordDate < tomorrow) {
        const dayOfWeek = recordDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
        if (record.checkInTime) {
          weeklyAttendance[dayOfWeek]++;
        }
      }
    });
    
    // Calculate monthly attendance for charting
    const monthStart = new Date(today);
    monthStart.setDate(1); // Start of the month
    
    const labels = [];
    const present = [];
    const absent = [];
    const partial = [];
    
    // Generate dates for the current month
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Filter records for this date
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      
      const dayRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= dateStart && recordDate < dateEnd;
      });
      
      // Count unique students by status
      const uniqueEmails = new Set();
      dayRecords.forEach(record => uniqueEmails.add(record.email));
      
      // For each unique student on this day, determine their status
      let presentCount = 0;
      let partialCount = 0;
      
      uniqueEmails.forEach(email => {
        const studentRecords = dayRecords.filter(r => r.email === email);
        const hasPresent = studentRecords.some(r => r.status === 'present');
        const hasPartial = studentRecords.some(r => r.status === 'half-day');
        
        if (hasPresent) {
          presentCount++;
        } else if (hasPartial) {
          partialCount++;
        }
      });
      
      const absentCount = Math.max(0, students.length - (presentCount + partialCount));
      
      present.push(presentCount);
      partial.push(partialCount);
      absent.push(absentCount);
    }
    
    // Campus-specific stats
    const campusStats = {
      bbsr: { totalStudents: 0, presentToday: 0, absentToday: 0, partialToday: 0, attendanceRate: 0 },
      pkd: { totalStudents: 0, presentToday: 0, absentToday: 0, partialToday: 0, attendanceRate: 0 },
      vzm: { totalStudents: 0, presentToday: 0, absentToday: 0, partialToday: 0, attendanceRate: 0 }
    };
    
    // Count students by campus
    students.forEach(student => {
      const campus = (student.campus || '').toLowerCase();
      if (campus === 'bbsr' || campus === 'pkd' || campus === 'vzm') {
        campusStats[campus as keyof typeof campusStats].totalStudents++;
      }
    });
    
    // Get present students by campus
    const presentStudentsByCampus = new Map<string, Set<string>>();
    const partialStudentsByCampus = new Map<string, Set<string>>();
    
    // Initialize sets for each campus
    ['bbsr', 'pkd', 'vzm'].forEach(campus => {
      presentStudentsByCampus.set(campus, new Set<string>());
      partialStudentsByCampus.set(campus, new Set<string>());
    });
    
    // Process today's attendance records
    todayAttendance.forEach(record => {
      const student = students.find(s => 
        s._id.toString() === (record.testUserId ? record.testUserId.toString() : '') || 
        s.email === record.email
      );
      
      if (student) {
        const campus = (student.campus || '').toLowerCase();
        if (campus === 'bbsr' || campus === 'pkd' || campus === 'vzm') {
          if (record.status === 'present') {
            presentStudentsByCampus.get(campus)?.add(record.email);
          } else if (record.status === 'half-day') {
            partialStudentsByCampus.get(campus)?.add(record.email);
          }
        }
      }
    });
    
    // Update campus stats with counts
    ['bbsr', 'pkd', 'vzm'].forEach(campus => {
      const key = campus as keyof typeof campusStats;
      campusStats[key].presentToday = presentStudentsByCampus.get(campus)?.size || 0;
      campusStats[key].partialToday = partialStudentsByCampus.get(campus)?.size || 0;
      
      // Calculate absent students
      campusStats[key].absentToday = Math.max(
        0, 
        campusStats[key].totalStudents - (campusStats[key].presentToday + campusStats[key].partialToday)
      );
      
      // Calculate attendance rate
      campusStats[key].attendanceRate = campusStats[key].totalStudents > 0
        ? Math.round(
          ((campusStats[key].presentToday + campusStats[key].partialToday * 0.5) / 
          campusStats[key].totalStudents) * 100
        )
        : 0;
    });
    
    // Get recent check-ins for display
    const latestCheckIns = await Attendance.find({
      checkInTime: { $exists: true, $ne: null }
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
    
    // Prepare stats object with all calculated data
    const stats = {
      totalStudents: students.length,
      presentToday,
      absentToday: students.length - uniqueAttendeesToday,
      partialToday,
      checkInsToday: todayCheckins,
      checkOutsToday: todayCheckouts,
      activeSessions: activeSessions.length,
      uniqueAttendees: uniqueAttendeesToday,
      attendanceRate,
      avgDuration,
      weeklyAttendance,
      completeAttendance,
      campusStats,
      monthlyAttendance: {
        labels,
        present,
        absent,
        partial
      },
      latestCheckIns: latestCheckInsWithStudents
    };
    
    // Return the combined response
    return NextResponse.json({
      success: true,
      records: recordsWithStudents,
      students,
      absentStudents,
      stats
    });
    
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching dashboard data"
    }, { status: 500 });
  }
}

// Helper endpoint for verifying a student's attendance
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}