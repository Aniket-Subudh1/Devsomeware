import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import TestUsers from "@/models/TestUsers";
import AttendanceToken from "@/models/AttendanceToken";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// Generate attendance token for a student
export const POST = async (req: NextRequest) => {
    try {
        await ConnectDb();
        const data = await req.json();
        const { email } = data;

        if (!email) {
            return NextResponse.json({ 
                success: false, 
                message: "Email is required" 
            });
        }

        // Check if user exists
        interface User {
            _id: string;
            name: string;
            email: string;
            regno: string;
            branch: string;
            campus: string;
        }
        
        const user = await TestUsers.findOne({ email }).lean() as unknown as User;
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "User not registered for baseline. Please register first." 
            });
        }

        // Check if user already has an active token
        const existingToken = await AttendanceToken.findOne({ email });
        if (existingToken) {
            // Update the lastActive timestamp
            existingToken.lastActive = new Date();
            await existingToken.save();

            return NextResponse.json({
                success: true,
                message: "Token already exists",
                token: existingToken.token,
                user: {
                    name: user.name,
                    email: user.email,
                    regno: user.regno,
                    branch: user.branch,
                    campus: user.campus
                }
            });
        }

        // Generate a random salt for dynamic QR codes
        const salt = crypto.randomBytes(16).toString('hex');
        
        // Create JWT token with 12 hour expiry
        const token = jwt.sign(
            { email, id: user._id, salt },
            process.env.JWT_SECRET as string,
            { expiresIn: "12h" }
        );

        // Save token to database
        const newAttendanceToken = new AttendanceToken({
            email,
            testUserId: user._id,
            token,
            salt,
            isActive: true
        });

        await newAttendanceToken.save();

        return NextResponse.json({
            success: true,
            message: "Attendance token created successfully",
            token,
            user: {
                name: user.name,
                email: user.email,
                regno: user.regno,
                branch: user.branch,
                campus: user.campus
            }
        });
    } catch (err) {
        console.error("Error in attendance token route:", err);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error. Please try again."
        });
    }
};

// Get current QR code - this will be polled by the frontend
export const GET = async (req: NextRequest) => {
    try {
        const token = req.nextUrl.searchParams.get('token');
        
        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Token is required"
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
                email: string;
                id: string;
                salt: string;
            };

            // Check if token exists in database and is active
            const tokenRecord = await AttendanceToken.findOne({ 
                email: decoded.email,
                isActive: true
            });

            if (!tokenRecord) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid or expired token"
                });
            }

            // Update lastActive timestamp
            tokenRecord.lastActive = new Date();
            await tokenRecord.save();

            // Generate a dynamic code based on the current timestamp
            // The code changes every 2 seconds
            const currentTime = Math.floor(Date.now() / 2000); // Changes every 2 seconds
            const dynamicCode = crypto
                .createHmac('sha256', tokenRecord.salt)
                .update(currentTime.toString())
                .digest('hex');

            // Create the QR payload with the dynamic code
            const qrPayload = JSON.stringify({
                email: decoded.email,
                id: decoded.id,
                code: dynamicCode,
                timestamp: currentTime
            });

            return NextResponse.json({
                success: true,
                qrData: qrPayload
            });
        } catch  {
            return NextResponse.json({
                success: false,
                message: "Invalid token"
            });
        }
    } catch (err) {
        console.error("Error in get QR code route:", err);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error. Please try again."
        });
    }
};

// Endpoint to verify the token is still valid
export const PATCH = async (req: NextRequest) => {
    try {
        await ConnectDb();
        const data = await req.json();
        const { token } = data;

        if (!token) {
            return NextResponse.json({ 
                success: false, 
                message: "Token is required" 
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
                email: string;
            };

            // Find and update the token's lastActive timestamp
            const tokenRecord = await AttendanceToken.findOne({ 
                email: decoded.email,
                isActive: true
            });

            if (!tokenRecord) {
                return NextResponse.json({
                    success: false,
                    message: "Token not found or inactive"
                });
            }

            // Update lastActive timestamp
            tokenRecord.lastActive = new Date();
            await tokenRecord.save();

            return NextResponse.json({
                success: true,
                message: "Token is valid",
                email: decoded.email
            });
        } catch  {
            return NextResponse.json({
                success: false,
                message: "Invalid or expired token"
            });
        }
    } catch (err) {
        console.error("Error in verify token route:", err);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error. Please try again."
        });
    }
};

// Delete/invalidate token (used by admin)
export const DELETE = async (req: NextRequest) => {
    try {
        await ConnectDb();
        const email = req.nextUrl.searchParams.get('email');
        const adminPassword = req.nextUrl.searchParams.get('password');
        
        if (!email || !adminPassword) {
            return NextResponse.json({
                success: false,
                message: "Email and admin password are required"
            });
        }

        // Verify admin password
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({
                success: false,
                message: "Invalid admin password"
            });
        }

        // Invalidate the token
        await AttendanceToken.findOneAndUpdate(
            { email },
            { isActive: false }
        );

        return NextResponse.json({
            success: true,
            message: "Token invalidated successfully"
        });
    } catch (err) {
        console.error("Error in invalidate token route:", err);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error. Please try again."
        });
    }
};