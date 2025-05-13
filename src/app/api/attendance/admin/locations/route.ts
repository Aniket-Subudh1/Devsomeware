import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import CampusLocation from "@/models/CampusLocation";

export async function POST(req: NextRequest) {
  try {
    await ConnectDb();
    
    const data = await req.json();
    const { adminPassword, action, campusData } = data;
    
  
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: "Invalid admin password"
      }, { status: 401 });
    }
    
    if (action === "get") {
   
      const locations = await CampusLocation.find({}).lean();
      
      return NextResponse.json({
        success: true,
        locations
      });
    } 
    else if (action === "update" || action === "create") {
    
      if (!campusData || !campusData.name || !campusData.latitude || !campusData.longitude) {
        return NextResponse.json({
          success: false,
          message: "Missing required campus data fields"
        }, { status: 400 });
      }
      
  
      if (!['bbsr', 'pkd', 'vzm'].includes(campusData.name)) {
        return NextResponse.json({
          success: false,
          message: "Invalid campus name. Must be one of: bbsr, pkd, vzm"
        }, { status: 400 });
      }
      
     
      const result = await CampusLocation.findOneAndUpdate(
        { name: campusData.name },
        {
          ...campusData,
          lastUpdated: new Date(),
          updatedBy: "admin"
        },
        { upsert: true, new: true }
      );
      
      return NextResponse.json({
        success: true,
        message: `Campus location ${action === "create" ? "created" : "updated"} successfully`,
        location: result
      });
    }
    else if (action === "toggle") {
     
      if (!campusData || !campusData.name) {
        return NextResponse.json({
          success: false,
          message: "Missing campus name"
        }, { status: 400 });
      }
      
      const location = await CampusLocation.findOne({ name: campusData.name });
      
      if (!location) {
        return NextResponse.json({
          success: false,
          message: "Campus location not found"
        }, { status: 404 });
      }
      
      location.enabled = !location.enabled;
      location.lastUpdated = new Date();
      location.updatedBy = "admin";
      
      await location.save();
      
      return NextResponse.json({
        success: true,
        message: `Campus location ${location.enabled ? "enabled" : "disabled"} successfully`,
        location
      });
    }
    else {
      return NextResponse.json({
        success: false,
        message: "Invalid action"
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error("Error managing campus locations:", error);
    return NextResponse.json({
      success: false,
      message: "Error managing campus locations"
    }, { status: 500 });
  }
}

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