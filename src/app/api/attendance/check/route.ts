import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import TestUsers from "@/models/TestUsers";
import AttendanceToken from "@/models/AttendanceToken";
import Attendance from "@/models/Attendance";
import crypto from "crypto";


// Record attendance (check-in/check-out)
export const POST = async (req: NextRequest) => {
    try {
        await ConnectDb();
        const data = await req.json();
        const { qrData, adminPassword, action } = data;

        // Validate inputs
        if (!qrData || !adminPassword || !action) {
            return NextResponse.json({
                success: false,
                message: "QR data, admin password, and action (check-in/check-out) are required"
            });
        }

        // Verify admin password
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({
                success: false,
                message: "Invalid admin password"
            });
        }

        // Parse QR data
        let qrPayload;
        try {
            qrPayload = JSON.parse(qrData);
        } catch  {
            return NextResponse.json({
                success: false,
                message: "Invalid QR data format"
            });
        }

        const { email, id, code, timestamp } = qrPayload;

        if (!email || !id || !code || !timestamp) {
            return NextResponse.json({
                success: false,
                message: "Invalid QR data content"
            });
        }

        // Verify the QR code is recent (within last 10 seconds to allow scanning time)
        const currentTime = Math.floor(Date.now() / 2000);
        if (currentTime - timestamp > 5) { // Allow 10 seconds (5 * 2 second intervals)
            return NextResponse.json({
                success: false,
                message: "QR code has expired. Please refresh."
            });
        }

        // Get the token record to verify the code
        const tokenRecord = await AttendanceToken.findOne({ 
            email,
            isActive: true
        });

        if (!tokenRecord) {
            return NextResponse.json({
                success: false,
                message: "No active session found for this user"
            });
        }

        // Verify the dynamic code
        const expectedCode = crypto
            .createHmac('sha256', tokenRecord.salt)
            .update(timestamp.toString())
            .digest('hex');

        if (code !== expectedCode) {
            return NextResponse.json({
                success: false,
                message: "Invalid QR code"
            });
        }

        // Get the current date (without time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (action === 'check-in') {
            // Check if attendance already recorded for today
            const existingAttendance = await Attendance.findOne({
                email,
                date: today
            });

            if (existingAttendance) {
                return NextResponse.json({
                    success: false,
                    message: "Attendance already recorded for today"
                });
            }

            // Record check-in
            const newAttendance = new Attendance({
                email,
                testUserId: id,
                date: today,
                checkInTime: new Date(),
                status: 'present'
            });

            await newAttendance.save();

            return NextResponse.json({
                success: true,
                message: "Check-in recorded successfully",
                data: {
                    email,
                    name: (await TestUsers.findById(id))?.name || 'Unknown',
                    checkInTime: newAttendance.checkInTime
                }
            });
        } else if (action === 'check-out') {
            // Find the attendance record for today
            const attendanceRecord = await Attendance.findOne({
                email,
                date: today
            });

            if (!attendanceRecord) {
                return NextResponse.json({
                    success: false,
                    message: "No check-in record found for today"
                });
            }

            if (attendanceRecord.checkOutTime) {
                return NextResponse.json({
                    success: false,
                    message: "Check-out already recorded for today"
                });
            }

            // Record check-out time
            const checkOutTime = new Date();
            const durationInMinutes = Math.floor(
                (checkOutTime.getTime() - attendanceRecord.checkInTime.getTime()) / (1000 * 60)
            );

            attendanceRecord.checkOutTime = checkOutTime;
            attendanceRecord.duration = durationInMinutes;
            
            // Determine status based on duration
            if (durationInMinutes < 240) { // Less than 4 hours
                attendanceRecord.status = 'half-day';
            }

            await attendanceRecord.save();

            return NextResponse.json({
                success: true,
                message: "Check-out recorded successfully",
                data: {
                    email,
                    name: (await TestUsers.findById(id))?.name || 'Unknown',
                    checkInTime: attendanceRecord.checkInTime,
                    checkOutTime,
                    duration: durationInMinutes
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "Invalid action. Must be 'check-in' or 'check-out'"
            });
        }
    } catch (err) {
        console.error("Error in attendance check route:", err);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error. Please try again."
        });
    }
};

// Get attendance records (for admin)
export const GET = async (req: NextRequest) => {
    try {
        await ConnectDb();
        const adminPassword = req.nextUrl.searchParams.get('password');
        const startDate = req.nextUrl.searchParams.get('startDate');
        const endDate = req.nextUrl.searchParams.get('endDate');
        const email = req.nextUrl.searchParams.get('email');
        
        // Verify admin password
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({
                success: false,
                message: "Invalid admin password"
            });
        }

        // Define query type
        interface AttendanceQuery {
            email?: string;
            date?: {
                $gte?: Date;
                $lte?: Date;
            };
        }
        
        // Build query
        const query: AttendanceQuery = {};
        
        if (email) {
            query.email = email;
        }
        
        if (startDate || endDate) {
            query.date = {};
            
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        // Fetch attendance records
        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1, checkInTime: -1 })
            .populate('testUserId', 'name regno branch')
            .lean();

        // Calculate statistics
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
        const halfDays = attendanceRecords.filter(r => r.status === 'half-day').length;
        const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
        const attendance = totalDays > 0 
            ? ((presentDays + (halfDays * 0.5)) / totalDays * 100).toFixed(2) 
            : '0';

        return NextResponse.json({
            success: true,
            data: attendanceRecords,
            stats: {
                totalDays,
                presentDays,
                halfDays,
                absentDays,
                attendancePercentage: attendance
            }
        });
    } catch (err) {
        console.error("Error in get attendance records route:", err);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error. Please try again."
        });
    }
};