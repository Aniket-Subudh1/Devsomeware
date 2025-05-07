import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import TestUsers from "@/models/TestUsers";
import Attendance from "@/models/Attendance";

// Get attendance statistics and summaries for the admin dashboard
export const GET = async (req: NextRequest) => {
    try {
        await ConnectDb();
        const adminPassword = req.nextUrl.searchParams.get('password');
        const period = req.nextUrl.searchParams.get('period') || 'month'; 
        
        // Verify admin password
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({
                success: false,
                message: "Invalid admin password"
            });
        }

        // Calculate date range based on period
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let startDate = new Date(today);
        
        if (period === 'day') {
            // Just use today
        } else if (period === 'week') {
            // Start from last 7 days
            startDate.setDate(today.getDate() - 7);
        } else if (period === 'month') {
            // Start from last 30 days
            startDate.setDate(today.getDate() - 30);
        } else {
            // For 'total', start from a long time ago
            startDate = new Date(0); // January 1, 1970
        }

        // Get all students
        const students = await TestUsers.find().lean();
        
        // Get attendance records within date range
        const attendanceRecords = await Attendance.find({
            date: { $gte: startDate, $lte: today }
        }).lean();

        // Calculate attendance statistics per student
        const studentStats = await Promise.all(students.map(async (student) => {
            const studentRecords = attendanceRecords.filter(record => 
                record.email === student.email
            );
            
            const totalDays = studentRecords.length;
            const presentDays = studentRecords.filter(r => r.status === 'present').length;
            const halfDays = studentRecords.filter(r => r.status === 'half-day').length;
            const absentDays = studentRecords.filter(r => r.status === 'absent').length;
            
            const attendancePercentage = totalDays > 0 
                ? ((presentDays + (halfDays * 0.5)) / totalDays * 100).toFixed(2) 
                : '0';
                
            // Get total duration in hours
            const totalDuration = studentRecords.reduce((sum, record) => {
                return sum + (record.duration || 0);
            }, 0) / 60; // Convert minutes to hours
            
            return {
                id: student._id,
                name: student.name,
                email: student.email,
                regno: student.regno,
                branch: student.branch,
                totalDays,
                presentDays,
                halfDays,
                absentDays,
                attendancePercentage,
                totalHours: totalDuration.toFixed(2)
            };
        }));

        // Calculate overall statistics
        const totalStudents = students.length;
        const studentsWithAttendance = studentStats.filter(s => s.totalDays > 0).length;
        const avgAttendance = studentStats.length > 0
            ? studentStats.reduce((sum, s) => sum + parseFloat(s.attendancePercentage), 0) / totalStudents
            : 0;
        
        // Count students by attendance percentage ranges
        const attendanceRanges = {
            excellent: studentStats.filter(s => parseFloat(s.attendancePercentage) >= 90).length,
            good: studentStats.filter(s => parseFloat(s.attendancePercentage) >= 75 && parseFloat(s.attendancePercentage) < 90).length,
            average: studentStats.filter(s => parseFloat(s.attendancePercentage) >= 60 && parseFloat(s.attendancePercentage) < 75).length,
            poor: studentStats.filter(s => parseFloat(s.attendancePercentage) < 60).length,
            noAttendance: totalStudents - studentsWithAttendance
        };

        // Calculate daily attendance counts for charts
        const dailyAttendance = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= today) {
            const date = new Date(currentDate);
            const dateString = date.toISOString().split('T')[0];
            
            const dayRecords = attendanceRecords.filter(record => 
                new Date(record.date).toISOString().split('T')[0] === dateString
            );
            
            dailyAttendance.push({
                date: dateString,
                present: dayRecords.filter(r => r.status === 'present').length,
                halfDay: dayRecords.filter(r => r.status === 'half-day').length,
                absent: dayRecords.filter(r => r.status === 'absent').length,
                total: dayRecords.length
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return NextResponse.json({
            success: true,
            period,
            dateRange: {
                start: startDate.toISOString().split('T')[0],
                end: today.toISOString().split('T')[0]
            },
            overall: {
                totalStudents,
                studentsWithAttendance,
                avgAttendance: avgAttendance.toFixed(2),
                attendanceRanges
            },
            studentStats: studentStats.sort((a, b) => 
                parseFloat(b.attendancePercentage) - parseFloat(a.attendancePercentage)
            ),
            dailyAttendance
        });
    } catch (err) {
        console.error("Error in attendance dashboard route:", err);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error. Please try again."
        });
    }
};