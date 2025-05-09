
import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Attendance from "@/models/Attendance";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const data = await req.json();
    const { adminPassword, updateType } = data;
    
    // Verify admin password
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    // Connect to database
    await ConnectDb();
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let updatedCount = 0;
    
    if (updateType === "pending-checkouts") {
      const presentResult = await Attendance.updateMany(
        {
          date: {
            $gte: today,
            $lt: tomorrow
          },
          checkInTime: { $exists: true, $ne: null },
          checkOutTime: { $exists: true, $ne: null },
          status: { $ne: "present" } 
        },
        {
          $set: {
            status: "present"
          }
        }
      );
      
      updatedCount += presentResult.modifiedCount;
      
      // Then, update records with check-in but no check-out to "half-day"
      const partialResult = await Attendance.updateMany(
        {
          date: {
            $gte: today,
            $lt: tomorrow
          },
          checkInTime: { $exists: true, $ne: null },
          $or: [
            { checkOutTime: { $exists: false } },
            { checkOutTime: null }
          ],
          status: { $ne: "half-day" } // Only update if not already "half-day"
        },
        {
          $set: {
            status: "half-day"
          }
        }
      );
      
      updatedCount += partialResult.modifiedCount;
    }
    // Add support for a new update type that checks the whole database (not just today)
    else if (updateType === "fix-all-statuses") {
      // Update all records (not just today) with both check-in and check-out to "present"
      const presentResult = await Attendance.updateMany(
        {
          checkInTime: { $exists: true, $ne: null },
          checkOutTime: { $exists: true, $ne: null },
          status: { $ne: "present" } // Only update if not already "present"
        },
        {
          $set: {
            status: "present"
          }
        }
      );
      
      updatedCount += presentResult.modifiedCount;
      
      // Update all records (not just today) with check-in but no check-out to "half-day"
      const partialResult = await Attendance.updateMany(
        {
          checkInTime: { $exists: true, $ne: null },
          $or: [
            { checkOutTime: { $exists: false } },
            { checkOutTime: null }
          ],
          status: { $ne: "half-day" } // Only update if not already "half-day"
        },
        {
          $set: {
            status: "half-day"
          }
        }
      );
      
      updatedCount += partialResult.modifiedCount;
    }
    // Add a specific updater for records that should be present (with both check-in and check-out)
    else if (updateType === "fix-present-status") {
      // Update records that have both check-in and check-out to "present"
      const presentResult = await Attendance.updateMany(
        {
          checkInTime: { $exists: true, $ne: null },
          checkOutTime: { $exists: true, $ne: null }
        },
        {
          $set: {
            status: "present"
          }
        }
      );
      
      updatedCount = presentResult.modifiedCount;
    }
    // Add a specific option for correcting check-out cases today
    else if (updateType === "fix-checked-out-today") {
      // Find all records from today with check-in and check-out
      const completedRecords = await Attendance.find({
        date: {
          $gte: today,
          $lt: tomorrow
        },
        checkInTime: { $exists: true, $ne: null },
        checkOutTime: { $exists: true, $ne: null }
      });
      
      const updatePromises = completedRecords.map(record => {
        record.status = "present";
        // Update last action to check-out
        record.lastAction = "check-out";
        return record.save();
      });
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      updatedCount = completedRecords.length;
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