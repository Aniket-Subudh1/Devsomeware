import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
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
    
    const timestamp = Math.floor(Date.now() / 1000);
    
    const adminSignature = process.env.NEXT_PUBLIC_ADMIN_SIGNATURE || 'default-signature';
    
    const nonce = crypto.randomBytes(8).toString('hex');
    
    const qrPayload = {
      type,
      timestamp,
      adminSignature,
      nonce
    };
    
    return NextResponse.json({
      success: true,
      qrData: JSON.stringify(qrPayload)
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
    
    const stats = {
      todayCheckins: 12,
      todayCheckouts: 8,
      activeSessions: 15
    };
    
    return NextResponse.json({
      success: true,
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