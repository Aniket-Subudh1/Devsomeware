import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import ConnectDb from "@/middleware/connectDb";
import CampusLocation from "@/models/CampusLocation";
import AttendanceSettings from "@/models/AttendanceSettings";
import TestUsers from "@/models/TestUsers";

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
    
    const { adminPassword, type, adminLocation, campus } = data || {};
    
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
    
    // Get current attendance settings
    const settings = await AttendanceSettings.findOne({}) || {
      geoLocationEnabled: false,
      defaultRadius: 100,
      maxQrValiditySeconds: 10
    };
    
    // Prepare location data
    let locationData = null;
    
    if (settings.geoLocationEnabled && adminLocation) {
      // If campus is specified, validate against that campus location
      if (campus) {
        const campusLocation = await CampusLocation.findOne({ name: campus }).lean() as {
          latitude: number;
          longitude: number;
          radius?: number;
          enabled?: boolean;
          name: string;
        } | null;
        
        if (!campusLocation) {
          return NextResponse.json({
            success: false,
            message: `Campus '${campus}' not found`
          }, { status: 404 });
        }
        
        if (campusLocation.hasOwnProperty('enabled') && (campusLocation as { enabled?: boolean }).enabled === false) {
          return NextResponse.json({
            success: false,
            message: `Geolocation for campus '${campus}' is disabled`
          }, { status: 400 });
        }
        
        // Use campus coordinates as the center point
        locationData = {
          latitude: campusLocation.latitude,
          longitude: campusLocation.longitude,
          radius: campusLocation.radius || settings.defaultRadius,
          campus: campus
        };
      } 
      // Otherwise use the provided admin location
      else if (adminLocation.latitude && adminLocation.longitude) {
        // Try to determine which campus this location belongs to
        const campuses = await CampusLocation.find({ enabled: true }).lean();
        
        let matchedCampus = null;
        for (const c of campuses) {
          const distance = calculateDistance(
            adminLocation.latitude, 
            adminLocation.longitude,
            c.latitude,
            c.longitude
          );
          
          if (distance <= (c.radius || settings.defaultRadius)) {
            matchedCampus = c;
            break;
          }
        }
        
        locationData = {
          latitude: adminLocation.latitude,
          longitude: adminLocation.longitude,
          radius: settings.defaultRadius,
          campus: matchedCampus ? matchedCampus.name : null
        };
      }
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    
    const adminSignature = process.env.NEXT_PUBLIC_ADMIN_SIGNATURE || 'default-signature';
    
    // Generate cryptographically secure nonce for additional security
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // QR codes expire based on settings
    const expiresAt = timestamp + (settings.maxQrValiditySeconds || 10);
    
    // Generate unique session ID for this QR code generation
    const sessionId = crypto.randomBytes(8).toString('hex');
    
    // Build the payload with all the necessary data
    const payloadData = {
      type,
      timestamp,
      expiresAt, 
      adminSignature,
      nonce,
      sessionId,
      location: locationData,
      geoRequired: settings.geoLocationEnabled,
      v: 3 // Version 3 of QR code protocol with geolocation support
    };
    
    // Add a digital signature to prevent tampering
    const payloadToSign = JSON.stringify(payloadData) + (process.env.JWT_SECRET || 'fallback-secret');
    const signature = crypto
      .createHash('sha256')
      .update(payloadToSign)
      .digest('hex');
    
    const qrPayload = {
      ...payloadData,
      sig: signature.substring(0, 16) // First 16 chars of signature is enough
    };
    
    // Retrieve stats for the response
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all attendance records for today
    const Attendance = (await import('@/models/Attendance')).default;
    const StudentSession = (await import('@/models/StudentSession')).default;
    
    const todayAttendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).lean();
    
    // Count check-ins and check-outs properly
    const todayCheckins = todayAttendance.filter(record => record.checkInTime).length;
    const todayCheckouts = todayAttendance.filter(record => record.checkOutTime).length;
    
    // Count active sessions
    const activeSessions = await StudentSession.find({ isActive: true }).lean();
    
    // Get student statistics for the campus if specified
    let campusStats = null;
    if (locationData && locationData.campus) {
      interface TestUser {
        _id: string | number | object;
        campus: string;
        [key: string]: unknown;
      }
      
      const campusStudents = await TestUsers.find({ 
        campus: locationData.campus 
      }).lean() as unknown as TestUser[];
      
      const campusAttendance = todayAttendance.filter(record => {
        const student = campusStudents.find(s => 
          s._id.toString() === (record.testUserId ? record.testUserId.toString() : '')
        );
        return !!student;
      });
      
      campusStats = {
        totalStudents: campusStudents.length,
        presentToday: campusAttendance.filter(r => r.status === 'present').length,
        checkInsToday: campusAttendance.filter(r => r.checkInTime).length,
        checkOutsToday: campusAttendance.filter(r => r.checkOutTime).length
      };
    }
    
    const stats = {
      todayCheckins,
      todayCheckouts,
      activeSessions: activeSessions.length,
      campusStats
    };
    
    return NextResponse.json({
      success: true,
      qrData: JSON.stringify(qrPayload),
      geoLocationEnabled: settings.geoLocationEnabled,
      location: locationData,
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
      geoLocationEnabled: false,
      defaultRadius: 100,
      maxQrValiditySeconds: 10
    };
    
    // Get all campus locations
    const campusLocations = await CampusLocation.find({ enabled: true }).lean();
    
    const Attendance = (await import('@/models/Attendance')).default;
    const StudentSession = (await import('@/models/StudentSession')).default;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all attendance records for today
    const todayAttendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).lean();
    
    // Count check-ins and check-outs properly
    const todayCheckins = todayAttendance.filter(record => record.checkInTime).length;
    const todayCheckouts = todayAttendance.filter(record => record.checkOutTime).length;
    
    // Count active sessions
    const activeSessions = await StudentSession.find({ isActive: true }).lean();
    
    const stats = {
      todayCheckins,
      todayCheckouts,
      activeSessions: activeSessions.length
    };
    
    return NextResponse.json({
      success: true,
      settings,
      campusLocations,
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

// Helper function to calculate distance between two points using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}