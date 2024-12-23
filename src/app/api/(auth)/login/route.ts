import { NextRequest, NextResponse } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import Users from "@/models/Users";
import { cookies } from 'next/headers'
export const POST = async (req: NextRequest) => {
    const cookie = await cookies()
    try {
        await ConnectDb();
        const data = await req.json();
        const userexists = await Users.findOne({ email: data.email });
        //if user is not exists
        //parse the input with zod
        //validate the input
        if (userexists == null) {
            return NextResponse.json({ message: "User not found", success: false });
        }
        const decryptpassword = CryptoJS.AES.decrypt(userexists.password, process.env.AES_SECRET || "").toString(CryptoJS.enc.Utf8);
        //if password is incorrect
        if (decryptpassword != data.password) {
            return NextResponse.json({ message: "Password is incorrect", success: false });
        }
        //if passwoerd is correct
        const token = jwt.sign({ email: userexists.email, name: userexists.name }, process.env.JWT_SECRET || "");
        //put it onto database for sso
        await Users.updateOne({ email: userexists.email }, { token: token });

        //setting the cookie
        cookie.set('token', token, { httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) }); //expires IN 7dayS
        return NextResponse.json({ message: "Login success", success: true });
    }
    catch(err) {
        console.log("login error"+err)
        return NextResponse.json({ message: "Something went wrong.Please try agin later", success: false })
}
}