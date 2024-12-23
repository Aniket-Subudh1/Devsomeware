import mongoose from "mongoose";
const LeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    github: {
        type: String,
        required: true
    },
    linkedin:{
        type: String,
        required: true
    },
    img:{
        type: String,
        required: false
    },
    intrests:{
        type: Array,
        required: false
    },
    languages:{
        type: String,
        required: false
    },
    frameworks:{
        type: String,
        required: false
    },
    projects:{
        type: String,
        required: false
    },
    why:{
        type: String,
        required: false
    },
    expectations:{
        type: String,
        required: false
    },
    isselected:{
        type: Boolean,
        required: false,
        default:false
    },
    leadposition:{
        type: String,
        required: false,
    }
},{timestamps:true});
export default mongoose.models.Leads || mongoose.model("Leads",LeadSchema);

