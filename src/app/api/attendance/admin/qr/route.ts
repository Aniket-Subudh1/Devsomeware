import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import ConnectDb from "@/middleware/connectDb";
import AttendanceSettings from "@/models/AttendanceSettings";

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    
    let data;
    try {
      data = await req.json();
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return NextResponse.json({
        success: false,
        message: "Invalid request format"
      }, { status: 400 });
    }
    
    const { adminPassword, type } = data || {};
    
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    if (type !== 'check-in' && type !== 'check-out') {
      return NextResponse.json({
        success: false,
        message: "Invalid QR type. Must be 'check-in' or 'check-out'"
      }, { status: 400 });
    }
    
    
    const settings = await AttendanceSettings.findOne({}) || {
      maxQrValiditySeconds: 1800 
    };
    
    const timestamp = Math.floor(Date.now() / 1000);
    
    const adminSignature = process.env.NEXT_PUBLIC_ADMIN_SIGNATURE || 'default-signature';
    
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const expiresAt = timestamp + (settings.maxQrValiditySeconds || 1800);
    
    const sessionId = crypto.randomBytes(8).toString('hex');
    
    const payloadData = {
      type,
      timestamp,
      expiresAt, 
      adminSignature,
      nonce,
      sessionId,
      v: 3
    };

    const payloadToSign = JSON.stringify(payloadData) + (process.env.JWT_SECRET || 'fallback-secret');
    const signature = crypto
      .createHash('sha256')
      .update(payloadToSign)
      .digest('hex');
    
    const qrPayload = {
      ...payloadData,
      sig: signature.substring(0, 16) 
    };
    
    let stats = {
      todayCheckins: 0,
      todayCheckouts: 0,
      activeSessions: 0
    };
    
    try {
    
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
    
      const Attendance = (await import('@/models/Attendance')).default;
      const StudentSession = (await import('@/models/StudentSession')).default;
  
      const [todayAttendance, activeSessions] = await Promise.all([
        Attendance.find({
          date: {
            $gte: today,
            $lt: tomorrow
          }
        }).lean(),
        StudentSession.countDocuments({ isActive: true })
      ]);

      const todayCheckins = todayAttendance.filter(record => record.checkInTime).length;
      const todayCheckouts = todayAttendance.filter(record => record.checkOutTime).length;
      
      stats = {
        todayCheckins,
        todayCheckouts,
        activeSessions
      };
    } catch (statsError) {
    
      console.warn("Error fetching stats for QR response:", statsError);
    }
    
    return NextResponse.json({
      success: true,
      qrData: JSON.stringify(qrPayload),
      stats
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminPassword = req.nextUrl.searchParams.get('password');
    
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    await ConnectDb();
    
    // Get attendance settings
    const settings = await AttendanceSettings.findOne({}) || {
      maxQrValiditySeconds: 1800 // 30 minutes
    };
    
    const Attendance = (await import('@/models/Attendance')).default;
    const StudentSession = (await import('@/models/StudentSession')).default;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Using Promise.all to run these queries in parallel
    const [todayAttendance, activeSessions] = await Promise.all([
      Attendance.find({
        date: {
          $gte: today,
          $lt: tomorrow
        }
      }).lean(),
      StudentSession.countDocuments({ isActive: true })
    ]);
    
    const todayCheckins = todayAttendance.filter(record => record.checkInTime).length;
    const todayCheckouts = todayAttendance.filter(record => record.checkOutTime).length;
    
    const stats = {
      todayCheckins,
      todayCheckouts,
      activeSessions
    };
    
    return NextResponse.json({
      success: true,
      settings,
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