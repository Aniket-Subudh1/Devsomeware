import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import TestUsers from "@/models/TestUsers";

export async function GET(req: NextRequest) {
  try {
    const adminPassword = req.nextUrl.searchParams.get('password');
    const campusFilter = req.nextUrl.searchParams.get('campus');
    
    // Verify admin credentials
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    await ConnectDb();
    
    // Build query filter
    const filter: { campus?: string } = {};
    
    if (campusFilter && campusFilter !== 'all') {
      filter.campus = campusFilter;
    }
    
    // Get all students or filtered by campus
    const students = await TestUsers.find(filter).sort({ name: 1 }).lean();
    
    // Count students by campus
    const campusCounts = {
      bbsr: 0,
      pkd: 0,
      vzm: 0
    };
    
    students.forEach(student => {
      const campus = student.campus?.toLowerCase();
      if (campus === 'bbsr' || campus === 'pkd' || campus === 'vzm') {
        campusCounts[campus as keyof typeof campusCounts]++;
      }
    });
    
    return NextResponse.json({
      success: true,
      students,
      campusCounts,
      totalCount: students.length
    });
    
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching students"
    }, { status: 500 });
  }
}