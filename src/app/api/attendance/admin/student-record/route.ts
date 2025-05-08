import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";

export async function GET(req: NextRequest) {
  try {
    const adminPassword = req.nextUrl.searchParams.get('password');
    const studentId = req.nextUrl.searchParams.get('studentId');
    const dateParam = req.nextUrl.searchParams.get('date');
    
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
    
    // Determine date to search for
    let searchDate;
    if (dateParam) {
      searchDate = new Date(dateParam);
    } else {
      searchDate = new Date();
    }
    searchDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const record = await Attendance.findOne({
      testUserId: studentId,
      date: {
        $gte: searchDate,
        $lt: nextDay
      }
    }).lean();
    
    return NextResponse.json({
      success: true,
      record: record || null
    });
    
  } catch (error) {
    console.error("Error fetching student record:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching student record"
    }, { status: 500 });
  }
}