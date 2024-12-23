import { NextRequest,NextResponse } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Users from "@/models/Users";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
export const POST = async (req: NextRequest) => {
    try{
        //intializing nodemailer
        await ConnectDb();
        const data = await req.json();
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD,
            },
          });
          //check the user is exists or not 
          const user = await Users.findOne({email:data.email})
          if(user==null){
            return NextResponse.json({message:"User does not exist or cannot reset the password.",success:false});
          }
          //if exists create token send it back to user via email
          const token = jwt.sign({email:user.email,name:user.name},process.env.JWT_SECRET||"");
          //add it to token not to bypass the endpoint
          await Users.findByIdAndUpdate(user._id,{token:token});
          //SEND THE RESET PASSWORD LINK TO THE USER
          const info = await transporter.sendMail({
            from: '"DevSomeware" <account@devsomeware.com>', // sender address
            to: user.email, // list of receivers
            subject: "Devsomeware: User Password Reset Request", // Subject line
            text: "Hello world?", // plain text body
            html: `
            <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              background-color: #f8f9fc;
              color: #333;
            }
        
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #e4e7ec;
            }
        
            .email-header {
              background: #004aad;
              color: #fff;
              text-align: center;
              padding: 20px;
              position: relative;
            }
        
            .email-header img {
              width: 50px;
              height: auto;
              display: block;
              margin: 0 auto 10px;
            }
        
            .email-header h1 {
              margin: 0;
              font-size: 24px;
            }
        
            .email-body {
              padding: 25px;
              line-height: 1.6;
              color: #4a4a4a;
            }
        
            .email-body h2 {
              font-size: 22px;
              color: #333;
              margin-bottom: 15px;
            }
        
            .email-body p {
              margin: 10px 0;
            }
        
            .email-button {
              text-align: center;
              margin: 30px 0;
            }
        
            .email-button a {
              background: #004aad;
              color: #ffffff;
              text-decoration: none;
              padding: 14px 24px;
              font-size: 16px;
              border-radius: 6px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              transition: background-color 0.3s ease, box-shadow 0.3s ease;
            }
        
            .email-button a:hover {
              background: #003080;
              box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
            }
        
            .email-footer {
              text-align: center;
              padding: 20px;
              background: #f8f9fc;
              font-size: 14px;
              color: #777;
              border-top: 1px solid #e4e7ec;
            }
        
            .email-footer a {
              color: #004aad;
              text-decoration: none;
            }
        
            .email-footer a:hover {
              text-decoration: underline;
            }
        
            @media screen and (max-width: 600px) {
              .email-body {
                padding: 15px;
              }
        
              .email-header h1 {
                font-size: 20px;
              }
        
              .email-button a {
                padding: 12px 18px;
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Header with Branding -->
            <div class="email-header">
              <img src="https://aniket-1.s3.ap-south-1.amazonaws.com/LOGO1-removebg-preview.png" alt="Devsomeware Logo">
              <h1>Devsomeware</h1>
            </div>
            <!-- Body -->
            <div class="email-body">
              <h2>Password Reset Request</h2>
              <p>Hi there,</p>
              <p>We received a request to reset your password. No worries! Click the button below to create a new password:</p>
              <div class="email-button">
                <a href="${process.env.FRONTEND_URL}/reset?token=${token}" target="_blank">Reset Password</a>
              </div>
              <p>If you did not request a password reset, you can safely ignore this email. If you have any questions, feel free to <a href="mailto:support@devsomeware.com">contact our support team</a>.</p>
            </div>
            <!-- Footer -->
            <div class="email-footer">
              <p>Need help? <a href="mailto:support@devsomeware.com">Contact Support</a></p>
              <p>© Devsomeware, All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
        
            `, // html body
          });
          console.log("Message sent: %s", info.messageId);
          return NextResponse.json({message:"Reset password link sent to your email",success:true});
        
        
        }
        catch(err){
            return NextResponse.json({message:`Error in forgot end ${err}`,success:false});
        }
}