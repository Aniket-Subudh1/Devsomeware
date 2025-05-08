import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";

export async function GET(req: NextRequest) {
  try {
    const adminPassword = req.nextUrl.searchParams.get('password');
    const studentId = req.nextUrl.searchParams.get('studentId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30', 10);
    
    // Verify admin credentials
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    // Validate request parameters
    if (!studentId) {
      return NextResponse.json({
        success: false,
        message: "Student ID is required"
      }, { status: 400 });
    }
    
    await ConnectDb();
    
    // Find attendance records for the student
    const records = await Attendance.find({
      testUserId: studentId
    })
    .sort({ date: -1 })
    .limit(limit)
    .lean();
    
    return NextResponse.json({
      success: true,
      records: records || []
    });
    
  } catch (error) {
    console.error("Error fetching student history:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching student history"
    }, { status: 500 });
  }
}