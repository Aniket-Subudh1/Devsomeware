import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    const data = await req.json();
    const { adminPassword } = data;
    
    // Verify admin password is set in env
    if (!process.env.ADMIN_PASSWORD) {
      console.error("ADMIN_PASSWORD environment variable is not set");
      return NextResponse.json({
        success: false,
        message: "Server configuration error"
      }, { status: 500 });
    }
    
    // Validate admin password against the environment variable
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    // Admin is authenticated
    return NextResponse.json({
      success: true,
      message: "Admin authentication successful"
    });
  } catch (error) {
    console.error("Error in admin verification:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}