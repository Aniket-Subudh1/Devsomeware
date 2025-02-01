import { NextResponse,NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import EventReg from "@/models/EventReg";
import VerifyUser from "@/server/VerifyUser";
export const POST = async (req:NextRequest) => {
    try{
    const data = await req.json();
    console.log(data);
    await ConnectDb();
    const verifyResult = await VerifyUser();
    if(!verifyResult.isAuth){
    return NextResponse.json({message:"User not authenticated. UnAuthorized access",success:false});
    }
    const findoneevent = await EventReg.findOne({userid:data.id,eventid:data.eventid});
    if(findoneevent){
        return NextResponse.json({message:"User already registered for the event",success:false});
    }
    const ticketid = Math.random().toString(36).substring(7)+"DSW";
    const newEvent = new EventReg({
        userid:data.id,
        eventid:data.eventid,
        eventname:data.eventname,
        ticketid:ticketid,
        email:data.email,
    });
    await newEvent.save();
    return NextResponse.json({message:"Event Registered Successfully",success:true});
}
    catch(err){
        console.log(err);
        return NextResponse.json({message:"Error in Event Registration. Please try again later.",success:false});
    }
}