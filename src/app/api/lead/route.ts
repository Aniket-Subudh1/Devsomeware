import { NextResponse,NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Leads from "@/models/Leads";
import nodemailer from "nodemailer";
import Users from "@/models/Users";
export const POST = async (req: NextRequest) => {
    try{
        await ConnectDb();
        const data = await req.json();
        //check the user is exists or not
        //parse all the input with zod 
        console.log(data);
        //todo
        const lead = await Leads.findOne({email:data.email});
        const user = await Users.findOne({email:data.email});
        if(user==null){
            return NextResponse.json({message:"To apply for the lead or co-lead position, you must be a community member. Please create a member account before submitting your application.",success:false});
        }
        if(lead!=null){
            return NextResponse.json({message:"Lead application already exists with this email",success:false});
        }
        //create the lead application
        const newLead = new Leads({
            name:data.name,
            email:data.email,
            github:data.github,
            linkedin:data.linkedin,
            img:data.img,
            intrests:data.interests,
            languages:data.languages,
            frameworks:data.frameworks,
            projects:data.projects,
            why:data.why,
            expectations:data.expectations,
        });
        await newLead.save();
        //send the email to user that we have received your application asynchronously
        //send the response back to the user
        sendEmail(data.name,data.email);
        return NextResponse.json({message:"Lead application registered successfully",success:true});
    }
    catch(err){
        console.log("error in the leads route",err);
        return NextResponse.json({message:"Internal Server Error. Please try again after sometime",success:false});
    }
}
//send email function
const  sendEmail = async(name:string,email:string)=>{
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
            from: '"DevSomeware" <lead@devsomeware.com>', // sender address
            to: email, // list of receivers
            cc:"basir@devsomeware.com,aniket@devsomeware.com,swagat@devsomeware.com,ankit@devsomeware.com,saneev.das@devsomeware.com",
            subject: `🚀 Exciting News, ${name}! Your Lead/Co-Lead Application at DevSomeware is Received 🎉`, // Subject line
            text: "Your Lead/Co-Lead Application at DevSomeware is Received 🎉", // plain text body
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* General Styles */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 20px 10px;
        }
        .email-header img {
            max-width: 120px;
            margin-bottom: 10px;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
        }
        .email-body {
            padding: 20px 15px;
            line-height: 1.6;
        }
        .email-body h2 {
            margin-top: 0;
            font-size: 20px;
            color: #4CAF50;
        }
        .email-footer {
            background-color: #f4f4f9;
            text-align: center;
            padding: 15px;
            font-size: 14px;
            color: #777;
        }
        .email-footer a {
            color: #4CAF50;
            text-decoration: none;
        }
        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            margin-top: 20px;
            border-radius: 5px;
            text-decoration: none;
            font-size: 16px;
        }
        .button:hover {
            background-color: #45a049;
        }
        .disclaimer {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
        }
        /* Responsive Design */
        @media (max-width: 600px) {
            .email-container {
                padding: 0 10px;
            }
            .email-body {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Email Header -->
        <div class="email-header">
            <img src="https://aniket-1.s3.ap-south-1.amazonaws.com/LOGO1-removebg-preview.png" alt="DevSomeware Logo">
            <h1>DevSomeware</h1>
        </div>
        <!-- Email Body -->
        <div class="email-body">
            <h2>We Received Your Application!</h2>
            <p>Dear ${name},</p>
            <p>Thank you for applying as a Lead/Co-Lead at <strong>DevSomeware</strong>. We are thrilled to see your interest and are currently reviewing your application.</p>
            <p>Please keep an eye on your email inbox for further updates. We'll get back to you shortly with the next steps in the process.</p>
            <p>Meanwhile, feel free to explore our platform and see what we’re all about.</p>
            <a href="https://devsomeware.com" class="button">Visit Our Website</a>
            <p class="disclaimer">This is a system-generated response. Please do not reply to this email.</p>
        </div>
        <!-- Email Footer -->
        <div class="email-footer">
            <p>Need help? Contact us at <a href="mailto:support@devsomeware.com">support@devsomeware.com</a></p>
            <p>© 2024 DevSomeware. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
`, // html body
          });
        
          console.log("Message sent: %s", info.messageId);

    }
    catch(err){
        console.log("error in sending email",err);
    }
}