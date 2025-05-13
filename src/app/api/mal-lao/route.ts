import { NextResponse, NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import process from "process";
import TestUsers from "@/models/TestUsers";
import Cryptojs from "crypto-js";
export const GET = async (req:NextRequest) => {
    try{
    await ConnectDb();
    // process.exit(0);
     let password = "cutm@2025";
    const hashone = Cryptojs.AES.encrypt(password,process.env.AES_SECRET||"").toString()
    const decrypt = Cryptojs.AES.decrypt(hashone,process.env.AES_SECRET||"").toString(Cryptojs.enc.Utf8);

     const updateResult = await TestUsers.updateMany(
            {}, // empty filter to match all documents
            { $set: { password: hashone } }
        );

    console.log(decrypt);
    console.log(hashone);
    return NextResponse.json({
        message: "Success",
        data: hashone,
        data1: decrypt,
    });
    }
    catch(err:unknown){
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}
