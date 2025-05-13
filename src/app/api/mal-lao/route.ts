import { NextResponse, NextRequest } from "next/server";
import process from "process";

export const GET = async (req:NextRequest) => {
    try{
     process.exit(0);
    }
    catch(err:unknown){
        return NextResponse.json({
            message: "Error",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}
