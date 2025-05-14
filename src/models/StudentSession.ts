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
    scanHistory: [{
        nonce: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        action: {
            type: String,
            enum: ['check-in', 'check-out'],
            required: true
        }
    }],
    securityLogs: [{
        event: {
            type: String,
            required: true
        },
        details: {
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: {
            type: String
        },
        deviceId: {
            type: String
        }
    }],
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
    }],
    blockedDevices: [{
        deviceId: {
            type: String,
            required: true
        },
        reason: {
            type: String
        },
        blockedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });


StudentSessionSchema.index({ email: 1 });
StudentSessionSchema.index({ deviceId: 1 });
StudentSessionSchema.index({ 'scanHistory.nonce': 1 });
StudentSessionSchema.index({ isActive: 1 });
StudentSessionSchema.index({ deviceId: 1, email: 1 }, { unique: false });
StudentSessionSchema.index({ 'blockedDevices.deviceId': 1 });

export default mongoose.models.StudentSession || mongoose.model("StudentSession", StudentSessionSchema);