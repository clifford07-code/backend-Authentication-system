import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({

user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"usere",
    required:true
},

refreshTokenHash:{
    type:String,
    required:true
},

ip:{
    type:String,
    required:true
},

userAdgent:{
    type:String,
    required:true
},

revoked:{
    type:Boolean,
    default:false
}

},{
timestamps:true
});

const sessionModel = mongoose.model("session",sessionSchema);

export default sessionModel;