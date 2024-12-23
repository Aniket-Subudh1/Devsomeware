import { NextRequest,NextResponse } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Users from "@/models/Users";
import nodemailer from "nodemailer";
export const POST = async (req: NextRequest) => {
    try{
        await ConnectDb();
        const data = await req.json();
        console.log(data);
        const user = await Users.findOne({email:data.email});
        if(user==null){
            return NextResponse.json({message:"User doesnot exist",success:false});
        }
        const updateProfile = await Users.findOneAndUpdate({email:data.email},{
            name:data.name,
            img:data.img,
            github:data.github,
            linkedin:data.linkedin,
            intrests:data.intrests,
            languages:data.languages,
            frameworks:data.frameworks,
            projects:data.projects,
            why:data.why,
            bio:data.bio,
            expectations:data.expectations,
        },{new:true}); //update the user profile
      
        if(updateProfile==null){
            console.log("error in updating the profile");
            return NextResponse.json({message:"Internal Server Error. Please try again after sometime",success:false});
        }
        sendEmail(data.name,data.email);
        return NextResponse.json({message:"Profile updated successfully",success:true,data:updateProfile});
        //send email if you want to send the email to the user that your profile has been updated

    }
    catch(err){
        console.log("error in the leads route",err);
        return NextResponse.json({message:"Internal Server Error. Please try again after sometime",success:false});
    }
}

//send email function
const sendEmail = async(name:string,email:string)=>{
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
            from: '"DevSomeware" <account@devsomeware.com>', // sender address
            to: email, // list of receivers
            subject: "Your Profile Was Successfully Updated on DevSomeware 🚀", // Subject line
            text: "Your Profile Was Successfully Updated on DevSomeware ", // plain text body
            html: `
           <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Updated</title>
    <style>
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
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: #4CAF50;
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .email-header img {
            max-height: 50px;
        }
        .email-body {
            padding: 20px;
            line-height: 1.6;
        }
        .email-footer {
            background: #f4f4f9;
            padding: 10px 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .button:hover {
            background-color: #45a049;
        }
        .alert {
            color: red;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header Section -->
        <div class="email-header">
            <img src="https://aniket-1.s3.ap-south-1.amazonaws.com/LOGO1-removebg-preview.png" alt="DevSomeware Logo">
            <h1>DevSomeware</h1>
        </div>
        <!-- Body Section -->
        <div class="email-body">
            <h2>Your Profile Has Been Successfully Updated</h2>
            <p>Hello ${name},</p>
            <p>We wanted to inform you that your profile on DevSomeware was updated on:</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')} <br> <strong>Time:</strong> ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p>If you did not authorize this update, please contact us immediately by emailing us at <a href="mailto:support@devsomeware.com">support@devsomeware.com</a>.</p>
            <p class="alert">This is important to ensure the security of your account.</p>
            <p>Thank you for being a valued member of our open-source community!</p>
            <a href="https://devsomeware.com/profile" class="button">Visit Your Profile</a>
        </div>
        <!-- Footer Section -->
        <div class="email-footer">
            <p>DevSomeware Open-Source Community</p>
            <p>© 2024 DevSomeware. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        
            `, // html body
          });
          console.log("Message sent: %s", info.messageId);
    }
    catch(err){
        console.log("error in the send email function",err);
    }
}