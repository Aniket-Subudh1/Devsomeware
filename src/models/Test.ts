import mongoose from "mongoose";
const TestSchema = new mongoose.Schema({
    round: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },

},{timestamps:true});
export default mongoose.models.Test || mongoose.model("Test",TestSchema);

