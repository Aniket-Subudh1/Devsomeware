import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import AttendanceToken from "@/models/AttendanceToken";

/**
 * Middleware to verify attendance JWT tokens
 * @param req NextRequest object
 * @param handler The handler function to execute if authentication passes
 * @returns NextResponse
 */
interface DecodedToken {
  email: string;
  id: string;
  salt: string;
}

export const withAttendanceAuth = async (
  req: NextRequest,
  handler: (req: NextRequest, user: DecodedToken) => Promise<NextResponse>
) => {
  try {
    // Get token from query params or authorization header
    const token = 
      req.nextUrl.searchParams.get('token') || 
      req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Authentication token is required"
      }, { status: 401 });
    }
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
        id: string;
        salt: string;
      };
      
      // Check if token exists in database
      const tokenRecord = await AttendanceToken.findOne({
        email: decoded.email,
        isActive: true
      });
      
      if (!tokenRecord) {
        return NextResponse.json({
          success: false,
          message: "Invalid or inactive token"
        }, { status: 401 });
      }
      
      // Token is valid, update last active timestamp
      tokenRecord.lastActive = new Date();
      await tokenRecord.save();
      
      // Call the handler with the authenticated user
      return handler(req, decoded);
      
    } catch  {
      // Token verification failed
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 });
    }
  } catch (error) {
    console.error("Error in auth middleware:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
};

/**
 * Middleware to verify admin password
 * @param req NextRequest object
 * @param handler The handler function to execute if authentication passes
 * @returns NextResponse
 */
export const withAdminAuth = async (
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) => {
  try {
    // Get admin password from query params or request body
    const adminPassword = 
      req.nextUrl.searchParams.get('password') || 
      (req.method === 'POST' ? (await req.json()).adminPassword : null);
    
    if (!adminPassword) {
      return NextResponse.json({
        success: false,
        message: "Admin password is required"
      }, { status: 401 });
    }
    
    // Verify admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 403 });
    }
    
    // Call the handler
    return handler(req);
    
  } catch (error) {
    console.error("Error in admin auth middleware:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 });
  }
};