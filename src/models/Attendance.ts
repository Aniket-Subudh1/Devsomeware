import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    testUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestUsers',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime: {
        type: Date,
        required: false
    },
    duration: {
        type: Number, // in minutes
        required: false
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half-day'],
        default: 'present'
    }
}, { timestamps: true });

// Create compound index on email and date to ensure one attendance record per student per day
AttendanceSchema.index({ email: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);