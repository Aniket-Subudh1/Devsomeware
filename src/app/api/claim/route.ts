import { NextResponse, NextRequest } from "next/server";
import EventReg from "@/models/EventReg";

// get request
export const GET = async (request: NextRequest) => {
  try {
    // Get the ID from query parameters using the request parameter
    const id = request.nextUrl.searchParams.get('id');
    if(id==null||id==undefined){
        return NextResponse.json({ success: false, message: "Invalid request. Please provide a id in it" });
    }
    const data = await EventReg.findOne({ ticketid: id}).populate('userid');
    if(data==null){
        return NextResponse.json({ success: false, message: "No ticket found with this id" });
    }
    return NextResponse.json({ success: true, data });

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
export const POST = async(req:NextRequest)=>{
try{
const data = await req.json();
if(data.id==null||data.id==undefined){
    return NextResponse.json({ success: false, message: "Invalid request. Please provide a id in it" });
}
const data1 = await EventReg.findOne({ ticketid: data.id});
if(data1==null){
    return NextResponse.json({ success: false, message: "No ticket found with this id" });
}
if(data1.clm==true){
    return NextResponse.json({ success: false, message: "Ticket already claimed" });
}
const data2 = await EventReg.findOneAndUpdate({ ticketid: data.id}, {clm:true});
if(data2==null){
    return NextResponse.json({ success: false, message: "No ticket found with this id" });
}
return NextResponse.json({ success: true, message:"Ticket claimed successfully" });
}
catch(err){
    console.log(err);
    return NextResponse.json({
        success: false,
        message: "Something went wrong try again after sometime"
      });
    }
}