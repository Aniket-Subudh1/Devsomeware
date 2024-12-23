import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
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
    why:{
        type: String,
        required: false
    },
    token:{
        type: String,
        required: false
    },
    expectations:{
        type: String,
        required: false
    },
    bio:{
        type: String,
        required: false
    },
},{timestamps:true});
export default mongoose.models.Users || mongoose.model("Users",UserSchema);

