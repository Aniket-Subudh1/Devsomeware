"use server"
import { cookies } from "next/headers";
import Users from "@/models/Users";
import jwt from "jsonwebtoken";
import ConnectDb from "@/middleware/connectDb";

interface DecodedToken {
    email: string;
    
}

interface User {
    name: string;
    email: string;
    img: string;
    github: string;
    linkedin: string;
    intrests: string[];
    languages: string[];
    frameworks: string[];
    bio: string;
}

interface VerifyUserResult {
    isAuth: boolean;
    user?: string; 
    error?: string;
}

const VerifyUser = async (): Promise<VerifyUserResult> => {
    try {
        
        const cookieStore = await cookies(); 
        await ConnectDb();
        const tokenCookie = cookieStore.get("token");

        if (tokenCookie && tokenCookie.value) {
            const decoded: DecodedToken = jwt.verify(tokenCookie.value, process.env.JWT_SECRET || "") as DecodedToken;
            const user = await Users.findOne({ email: decoded.email }, { _id: 0, password: 0 }).lean();

            if (user) {
                return { isAuth: true, user: JSON.stringify(user) };
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
