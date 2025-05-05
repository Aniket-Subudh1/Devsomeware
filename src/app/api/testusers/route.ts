import { NextRequest,NextResponse } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import TestUsers from "@/models/TestUsers";
import jwt from "jsonwebtoken";
export const POST = async (req: NextRequest) => {
    try{
        await ConnectDb();
        const data = await req.json();
        const {name,email,regno,phone,branch,domain,campus} = data;
        if(!name || !email || !regno || !phone || !branch){
            return NextResponse.json({message:"Please fill all the fields",success:false});
        }
        const user = await TestUsers.findOne({email:email});
        if(user!=null){
            const token = jwt.sign({email},process.env.JWT_SECRET as string,{expiresIn:"1d"});
            return NextResponse.json({message:"User already exists",success:true,token:token});
        }
        const newUser = new TestUsers({
            name,
            email,
            regno,
            phone,
            branch,
            domain,
            campus
        });
        await newUser.save();
        const token = jwt.sign({email},process.env.JWT_SECRET as string,{expiresIn:"1d"});
        return NextResponse.json({message:"User created successfully",success:true,token:token});


    }
    catch(err){
        console.log("error in the test users route",err);
        return NextResponse.json({message:"Internal Server Error. Please try again after sometime",success:false});
    }
}