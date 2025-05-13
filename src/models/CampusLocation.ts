import mongoose from "mongoose";

const CampusLocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['bbsr', 'pkd', 'vzm'],
        unique: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    radius: {
        type: Number,
        required: true,
        default: 50
    },
    enabled: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: String,
        required: false
    }
}, { timestamps: true });


CampusLocationSchema.index({ name: 1 });

export default mongoose.models.CampusLocation || mongoose.model("CampusLocation", CampusLocationSchema);