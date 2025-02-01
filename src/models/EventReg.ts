import mongoose from "mongoose";
const EventSchema = new mongoose.Schema({
    userid: {type:mongoose.Schema.Types.ObjectId, ref: 'Users',required: true},
    eventid:{type:String,required:true},
    eventname:{type:String,required:true},
    ticketid:{type:String,required:true},
    email:{type:String,required:true},
    iszentrone:{type:Boolean,required:false,default:false},
},{timestamps:true});
export default mongoose.models.EventReg || mongoose.model("EventReg",EventSchema);

