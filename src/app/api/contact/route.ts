
import { NextRequest,NextResponse } from "next/server";
import nodemailer from "nodemailer";
export const GET = ()=>{
    return NextResponse.json({message:"GET METHOD"});
}
export const POST = async(req:NextRequest)=>{
    try{
        const data = await req.json();
        console.log(data);
        const ticket = Math.floor(Math.random() * 1000000)+"DSW";
        if(!data.email || !data.message){
            return NextResponse.json({message:"Email and Message is required",success:false,status:400});
        }
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
            from: '"Support DevSomeware" <support@devsomeware.com>', // sender address
            to: data.email, // list of receivers
            subject: `Support Ticket Submitted Successfully – #${ticket}`,
            text: "DevSomeware", // plain text body
            html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f7fa;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            line-height: 1.6;
        }
        .ticket-number {
            color: #007bff;
            font-weight: bold;
        }
        .footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 12px;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 25px;
            font-size: 16px;
            border-radius: 5px;
            margin-top: 20px;
            text-align: center;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #0056b3;
        }
        @media (max-width: 600px) {
            .header h1 {
                font-size: 22px;
            }
            .content {
                padding: 15px;
            }
            .button {
                width: 100%;
                text-align: center;
                padding: 14px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Support Request Submitted</h1>
        </div>
        <div class="content">
            <p>Hi <strong>${data.name},</strong></p>
            <p>Thank you for reaching out! We have received your support request and our team will contact you shortly.</p>
            
            <p>Your ticket number is: <span class="ticket-number">#${ticket}</span></p>
            
            <p>If you have any further details or need additional assistance, feel free to reply to this email by clicking the button below.</p>
               <a href="mailto:support@devsomeware.com?subject=Reply%20to%20Ticket%20#${ticket}" class="button">Reply to Ticket</a>
        </div>
        <div class="footer">
            &copy; 2024 devsomeware.com. All Rights Reserved.
        </div>
    </div>
</body>
</html>

            `, // html body
          });
          const info2 = await transporter.sendMail({
            from: '"Support DevSomeware" <support@devsomeware.com>', // sender address
            to: "ankit@devsomeware.com,aniket@devsomeware.com,basir@devsomeware.com,swagat@devsomeware.com,support@devsomeware.com", // list of receivers
            subject: `New Support Request – Action Required (Ticket #${ticket})`, // Subject line
            text: "DevSomeware", // plain text body
            html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f7fa;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #28a745;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            line-height: 1.6;
        }
        .details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .details p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 25px;
            font-size: 16px;
            border-radius: 5px;
            margin-top: 20px;
            text-align: center;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 12px;
            font-size: 12px;
            color: #777;
        }
        @media (max-width: 600px) {
            .header h1 {
                font-size: 22px;
            }
            .content {
                padding: 15px;
            }
            .button {
                width: 100%;
                text-align: center;
                padding: 14px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Support Ticket Received</h1>
        </div>
        <div class="content">
            <p>Hello Admin,</p>
            <p>A new support request has been submitted. Below are the details of the ticket:</p>
            
            <div class="details">
                <p><strong>Ticket Number:</strong> #${ticket}</p>
                <p><strong>User Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Message:</strong> ${data.message}.</p>
            </div>

            <p>Please address this ticket as soon as possible. Click the button below to reply directly to this ticket.</p>

            <a href="mailto:${data.email}?subject=Reply%20to%20Ticket%20#${ticket}" class="button">Reply to Ticket</a>
        </div>
        <div class="footer">
            &copy; 2024 devsomeware.com. All Rights Reserved.
        </div>
    </div>
</body>
</html>

            `, // html body
          });
          console.log("Message sent user: %s", info);
            console.log("Message sent admin: %s", info2);
          return NextResponse.json({message:"Email send successfully",data:data,success:true,status:201});
    }
    catch(err){
        console.log(err);
        return NextResponse.json({message:"Something went wrong. Please try again after some time",error:err,success:false,status:500});
    }
}