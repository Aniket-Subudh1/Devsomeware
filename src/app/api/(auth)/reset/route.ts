import { NextRequest,NextResponse } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import Users from "@/models/Users";
export const POST = async (req: NextRequest) => {
    try{
        await ConnectDb();
        const data = await req.json();
        //check the token is valid or not
        const token = jwt.verify(data.token,process.env.JWT_SECRET||"");
        if(token==null){
            return NextResponse.json({message:"Invalid token. Suspicious activity detected",success:false});
        }
        const user = await Users.findOne({email: (token as jwt.JwtPayload).email});
        //if provided token is not equal to the generated token then return the error
         //this is to prevent the bypass of the endpoint by the attacker to reset the password through any jwt get it by the user
        if(user.token!=data.token){
            return NextResponse.json({message:"Invalid token. Suspicious activity detected",success:false});
        }
        //if everything is fine then update the password
        const encryptedPassword = CryptoJS.AES.encrypt(data.password,process.env.AES_SECRET||"").toString();
        await Users.findByIdAndUpdate(user._id,{password:encryptedPassword,isforgot:false});
        return NextResponse.json({message:"Password reset successfully",success:true});
        }
        catch(err){
            return NextResponse.json({message:`Error in PasswordReset ${err}`,success:false});  
        } 
}