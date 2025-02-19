import { NextResponse } from "next/server";
import EventReg from "@/models/EventReg";
export const GET = async ()=>{
try{
const eventdata = await EventReg.find({}).populate('userid');
return NextResponse.json({status:200,data:eventdata,length:eventdata.length});
}
catch(err){
    console.log(err);
    return NextResponse.json({status:500,message:"Something went wrong please try again after sometime"});
}
}