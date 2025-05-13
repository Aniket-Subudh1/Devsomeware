import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import AttendanceSettings from "@/models/AttendanceSettings";

export async function GET(req: NextRequest) {
  try {
    const adminPassword = req.nextUrl.searchParams.get('password');
    
    // Verify admin credentials
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    await ConnectDb();
    
    // Get the settings (creates default if none exist)
    let settings = await AttendanceSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await AttendanceSettings.create({
        lastUpdated: new Date(),
        updatedBy: "admin"
      });
    }
    
    return NextResponse.json({
      success: true,
      settings
    });
    
  } catch (error) {
    console.error("Error fetching attendance settings:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching attendance settings"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    
    const data = await req.json();
    const { adminPassword, settings } = data;
    
    // Verify admin credentials
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    // Validate settings
    if (!settings) {
      return NextResponse.json({
        success: false,
        message: "No settings provided"
      }, { status: 400 });
    }
    
    // Update settings
    const updatedSettings = await AttendanceSettings.findOneAndUpdate(
      {}, // Empty filter to match the single document
      {
        ...settings,
        lastUpdated: new Date(),
        updatedBy: "admin"
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({
      success: true,
      message: "Attendance settings updated successfully",
      settings: updatedSettings
    });
    
  } catch (error) {
    console.error("Error updating attendance settings:", error);
    return NextResponse.json({
      success: false,
      message: "Error updating attendance settings"
    }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS support
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