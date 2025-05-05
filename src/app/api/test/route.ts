import { NextResponse ,NextRequest} from "next/server";
import Test from "@/models/Test";
 import ConnectDb from "@/middleware/connectDb";
export const POST = async (req:NextRequest) => {

    const { round, status,password } = await req.json();
    try {
        await ConnectDb();
        if(password !== process.env.TEST_PASSWORD){
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
        const newTest = new Test({
            round,
            status,
        });
    
        await newTest.save();
        return NextResponse.json({ message: "Test created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating test:", error);
        return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
    }
}


export const GET = async () => {
    try {
        await ConnectDb();
        const tests = await Test.find({});
        return NextResponse.json({ tests }, { status: 200 });
    } catch (error) {
        console.error("Error fetching tests:", error);
        return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
    }
}

export const PUT = async (req:NextRequest) => {
    const { id, status ,password} = await req.json();
    try {
        await ConnectDb();
        if(password !== process.env.TEST_PASSWORD){
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
        const updatedTest = await Test.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        return NextResponse.json({ message: "Test updated successfully", updatedTest }, { status: 200 });
    } catch (error) {
        console.error("Error updating test:", error);
        return NextResponse.json({ error: "Failed to update test" }, { status: 500 });
    }

}