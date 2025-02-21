import { NextResponse } from "next/server";
import EventReg from "@/models/EventReg";

export const GET = async () => {
  try {
    // Add timeout to prevent hanging connections
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 15000); // 15 second timeout
    });

    // Wrap database query in a promise
    const dbQueryPromise = async () => {
      const eventdata = await EventReg.find({})
        .populate('userid')
        .lean() // Convert MongoDB documents to plain JavaScript objects
        .exec(); // Ensure proper query execution
      
      return eventdata;
    };

    // Race between timeout and database query
    const eventdata = await Promise.race([
      dbQueryPromise(),
      timeoutPromise
    ]);

    // Ensure response is properly structured
    return new NextResponse(
      JSON.stringify({
        status: 200,
        data: eventdata,
      }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (err) {
    console.error('API Error:', err);

    // Return a properly structured error response
    return new NextResponse(
      JSON.stringify({
        status: 500,
        message: "Something went wrong please try again after sometime",
        error: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
};