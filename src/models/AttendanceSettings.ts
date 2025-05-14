import mongoose from "mongoose";

const AttendanceSettingsSchema = new mongoose.Schema({
    geoLocationEnabled: {
        type: Boolean,
        default: false
    },
    defaultRadius: {
        type: Number,
        default: 50  
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: String,
        required: false
    },
    maxQrValiditySeconds: {
        type: Number,
        default: 1800  
    },
    multiDeviceLimit: {
        type: Boolean,
        default: true
    },
    requireCheckOut: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

AttendanceSettingsSchema.statics.getSettings = async function() {
    const settings = await this.findOne({});
    if (settings) {
        return settings;
    }
    
    // Create default settings if none exist
    return await this.create({});
};

export default mongoose.models.AttendanceSettings || mongoose.model("AttendanceSettings", AttendanceSettingsSchema);