import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        require:[true,"user name is required"],
        unique:[true, "name must me unique"]
    },
     useremail:{
        type: String,
        require:[true,"user email is required"],
        unique:[true, "email must me unique"]
    },
     userpassword:{
        type: String,
        require:[true,"user password is required"]
   
    },
})

const userModel = mongoose.model("User",userSchema)

export default userModel;