import { NextRequest,NextResponse } from "next/server";
export const GET=async(_req:NextRequest)=>{
    return NextResponse.json({message:"GET request from sendemail route test v2 by developer basir khan"});
}