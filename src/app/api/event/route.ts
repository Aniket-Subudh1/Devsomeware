import { NextResponse,NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import EventReg from "@/models/EventReg";
import VerifyUser from "@/server/VerifyUser";
import nodemailer from "nodemailer";
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
    handleSendMail(data.email,data.name);
    return NextResponse.json({message:"Event Registered Successfully",success:true,event:newEvent});
}
    catch(err){
        console.log(err);
        return NextResponse.json({message:"Error in Event Registration. Please try again later.",success:false});
    }
}

const handleSendMail = async (email:string,name:string) => {
    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          const info = await transporter.sendMail({
            from: '"DevSomeware" <team@devsomeware.com>', // sender address
            to: email, // list of receivers,
            cc:"saneev.das@devsomeware.com,aniket@devsomeware.com,ankit@devsomeware.com,swagat@devsomeware.com,basir@devsomeware.com",
            subject: "✅ Confirmation: Successfully Registered for Zenetrone!", 
            text: "✅ Confirmation: Successfully Registered for Zenetrone!", // plain text body
            html: ``,
          });
          console.log('Message sent: %s', info.messageId);
    }
    
    catch(err){
        console.log(err);
    }
}