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
    lastCheckIn: {
        type: Date,
        required: false
    },
    lastCheckOut: {
        type: Date,
        required: false
    },
    totalAttendance: {
        type: Number,
        default: 0
    },
    consecutiveDays: {
        type: Number,
        default: 0
    },
    attendanceHistory: [{
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
            type: Number,
            required: false
        },
        status: {
            type: String,
            enum: ['present', 'half-day', 'absent'],
            default: 'present'
        }
    }]
}, { timestamps: true });

export default mongoose.models.StudentSession || mongoose.model("StudentSession", StudentSessionSchema);