import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { adminPassword, updateType } = data;
    
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    await ConnectDb();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let updatedCount = 0;
    
    if (updateType === "pending-checkouts") {
      const result = await Attendance.updateMany(
        {
          date: {
            $gte: today,
            $lt: tomorrow
          },
          checkInTime: { $exists: true, $ne: null },
          checkOutTime: { $exists: false },
          status: "present"
        },
        {
          $set: {
            status: "half-day"
          }
        }
      );
      
      updatedCount = result.modifiedCount;
    }
    
    return NextResponse.json({
      success: true,
      message: "Attendance status updated successfully",
      updatedCount
    });
    
  } catch (error) {
    console.error("Error updating attendance status:", error);
    return NextResponse.json({
      success: false,
      message: "Error updating attendance status"
    }, { status: 500 });
  }
}