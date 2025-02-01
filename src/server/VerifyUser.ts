"use server"
import { cookies } from "next/headers";
import Users from "@/models/Users";
import jwt from "jsonwebtoken";
import ConnectDb from "@/middleware/connectDb";
import EventReg from "@/models/EventReg";
interface DecodedToken {
    email: string;
    
}


interface VerifyUserResult {
    isAuth: boolean;
    user?: string; 
    error?: string;
    event?:string;
}

const VerifyUser = async (): Promise<VerifyUserResult> => {
    try {
        
        const cookieStore = await cookies(); 
        await ConnectDb();
        const tokenCookie = cookieStore.get("token");

        if (tokenCookie && tokenCookie.value) {
            const decoded: DecodedToken = jwt.verify(tokenCookie.value, process.env.JWT_SECRET || "") as DecodedToken;
            const user = await Users.findOne({ email: decoded.email }, {  password: 0 }).lean();
            const event = await EventReg.findOne({ email: decoded.email,eventname:"zenetrone" }).lean();

            if (user) {
                return { isAuth: true, user: JSON.stringify(user), event:JSON.stringify(event) };
            } else {
                return { isAuth: false, error: "No user found" };
            }
        } else {
            return { isAuth: false, error: "No token found" };
        }
    } catch (error) {
        console.error("Error in VerifyUser:", error);
        return { isAuth: false, error: "Error verifying user" };
    }
}

export default VerifyUser;
