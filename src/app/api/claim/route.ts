import { NextResponse, NextRequest } from "next/server";
import EventReg from "@/models/EventReg";

// get request
export const GET = async (request: NextRequest) => {
  try {
    // Get the ID from query parameters using the request parameter
    const id = request.nextUrl.searchParams.get('id');
    if(id==null||id==undefined){
        return NextResponse.json({success:false})
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      success: false,
      message: "Something went wrong try again after sometime"
    });
  }
};
//post and claim the ticket
export const POST = async()=>{

}