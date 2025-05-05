import mongoose from "mongoose";
const TestSchema = new mongoose.Schema({
    round: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },

},{timestamps:true});
export default mongoose.models.Test || mongoose.model("Test",TestSchema);

