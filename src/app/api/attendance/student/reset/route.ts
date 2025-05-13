import { NextRequest,NextResponse } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import TestUsers from "@/models/TestUsers";
export const POST = async (req: NextRequest) => {
    try{
        await ConnectDb();
        const data = await req.json();
        //check the token is valid or not
        const token = jwt.verify(data.token,process.env.JWT_SECRET||"");
        if(token==null){
            return NextResponse.json({message:"Invalid token. Suspicious activity detected",success:false});
        }
        const user = await TestUsers.findOne({email: (token as jwt.JwtPayload).email});
        if(user==null){
            return NextResponse.json({message:"User not found",success:false});
        }
        let currentPassword = CryptoJS.AES.decrypt(user.password,process.env.AES_SECRET||"").toString(CryptoJS.enc.Utf8);
        if(currentPassword !== data.currentPassword){
            return NextResponse.json({message:"Current password is incorrect",success:false});
        }
        if(data.password.length<5){
            return NextResponse.json({message:"Password must be at least 5 characters long",success:false});
        }

        //if everything is fine then update the password
        const encryptedPassword = CryptoJS.AES.encrypt(data.password,process.env.AES_SECRET||"").toString();
        await TestUsers.findByIdAndUpdate(user._id,{password:encryptedPassword});
        return NextResponse.json({message:"Password reset successfully",success:true});
        }
        catch(err){
            return NextResponse.json({message:`Error in PasswordReset ${err}`,success:false});  
        } 
}