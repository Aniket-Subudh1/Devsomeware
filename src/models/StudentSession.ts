import mongoose from "mongoose";

const StudentSessionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestUsers',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    deviceId: {
        type: String, 
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
   
}, { timestamps: true });

export default mongoose.models.StudentSession || mongoose.model("StudentSession", StudentSessionSchema);