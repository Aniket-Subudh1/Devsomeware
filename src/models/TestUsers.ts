import mongoose from "mongoose";
const TestUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    regno: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    branch:{
        type: String,
        required: true
    },
    domain:{
        type: String,
        required: false
    },
    campus:{
        type: String,
        required: false
    }

   
    

},{timestamps:true});
export default mongoose.models.TestUsers || mongoose.model("TestUserSchema",TestUserSchema);

