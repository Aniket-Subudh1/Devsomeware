import mongoose from "mongoose";

const AttendanceTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    testUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestUsers',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    salt: {
        type: String,  // Used to generate dynamic QR codes
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 43200 // 12 hours in seconds - token will be automatically deleted
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

export default mongoose.models.AttendanceToken || mongoose.model("AttendanceToken", AttendanceTokenSchema);