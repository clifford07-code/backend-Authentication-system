import userModel from "../models/usere.model.js";
import crypto from "crypto"
import jwt from "jsonwebtoken"
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import cookieParser from "cookie-parser";


// ================= REGISTER =================

export async function register(req,res) {
    
const {username,useremail,userpassword} = req.body;

const isAlreadyRegister = await userModel.findOne({
    $or:[
        {username},
        {useremail}
    ]
});

if(isAlreadyRegister){
    return res.status(409).json({
        message:"username and email already exist"
    });
}

const hashpassward = crypto
.createHash("sha256")
.update(userpassword)
.digest("hex");

const user = await userModel.create({
    username,
    useremail,
    userpassword: hashpassward
});

const refreshtoken = jwt.sign(
    { id:user._id },
    config.JWT_SECRET,
    { expiresIn:"1d" }
)

const refreshTokenHash = crypto
.createHash("sha256")
.update(refreshtoken)
.digest("hex");

const session = await sessionModel.create({
    user:user._id,
    refreshTokenHash,
    ip:req.ip,
    userAdgent:req.headers["user-agent"]
})

const accesstoken = jwt.sign(
{
    id:user._id,
    sessionId:session._id
},
config.JWT_SECRET,
{ expiresIn:"15m" }
);

res.cookie("refreshtoken",refreshtoken,{
    httpOnly:true,
    secure:false,   // for localhost testing
    sameSite:"strict",
    maxAge:7*24*60*60*1000
})

res.status(201).json({
    message:"user created successfully",
    user:{
        username,
        useremail
    },
    accesstoken
});

}


export async function Login(req,res){

    const {useremail , userpassword} = req.body

    const user=await userModel.findOne({useremail})

    if(!user){
        return res.status(401).json({
            message:"user not found"
        })
    }

    const hashpassward=crypto.createHash("sha256").update(userpassword).digest("hex")

    const ispasswordvalid=hashpassward===user.userpassword

        if(!ispasswordvalid){
        return res.status(401).json({
            message:"user not found"
        })
    }

    const refreshtoken=jwt.sign({
        id :user._id
    },config.JWT_SECRET,
    { expiresIn:"1d"})
     
    const refreshTokenHash=crypto.createHash("sha256").update(refreshtoken).digest("hex")

    const session= await sessionModel.create({
        user:user._id,
        refreshTokenHash,
        ip:req.ip,
        userAdgent:req.headers["user-agent"]
    })

     const accesstoken=jwt.sign({
        id :user._id,
        sessionid:session._id
    },config.JWT_SECRET,
    { expiresIn:"15m"})

    res.cookie("refreshtoken",refreshtoken,{
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:7*24*60*60*1000   
    })

    res.status(200).json({
        message:"loggin successfully!",
        user:{
            username:user.username,
            useremail:user.useremail
        },accesstoken,
    })

}


// ================= GET ME =================

export async function Get_me(req,res){

try{

const token = req.headers.authorization?.split(" ")[1];

if(!token){
    return res.status(401).json({
        message:"Token not found"
    })
}

const decoded = jwt.verify(token,config.JWT_SECRET)

const user = await userModel.findById(decoded.id)

if(!user){
    return res.status(404).json({
        message:"User not found"
    })
}

res.status(200).json({
    message:"User found",
    user:{
        username:user.username,
        useremail:user.useremail
    }
})

}
catch(error){

if(error.name === "TokenExpiredError"){
    return res.status(401).json({
        message:"token expired"
    })
}

res.status(500).json({
    message:"invalid token"
})

}

}



// ================= REFRESH TOKEN =================

export async function refreshtoken(req,res) {

const refreshtoken = req.cookies.refreshtoken

if(!refreshtoken){
    return res.status(401).json({
        message:"cookie not found"
    })
}

const decoded = jwt.verify(refreshtoken,config.JWT_SECRET)

const refreshTokenHash = crypto
.createHash("sha256")
.update(refreshtoken)
.digest("hex")

const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked:false
})

if(!session){
    return res.status(400).json({
        message:"session not found"
    })
}

const accesstoken = jwt.sign(
{ id:decoded.id },
config.JWT_SECRET,
{ expiresIn:"15m"}
)

const newRefreshtoken = jwt.sign(
{ id:decoded.id },
config.JWT_SECRET,
{expiresIn:"1d"}
)

const newRefreshTokenHash = crypto
.createHash("sha256")
.update(newRefreshtoken)
.digest("hex")

session.refreshTokenHash = newRefreshTokenHash
await session.save()

res.cookie("refreshtoken",newRefreshtoken,{
    httpOnly:true,
    secure:false,
    sameSite:"strict",
    maxAge:7*24*60*60*1000
})

res.status(200).json({
    message:"access token refreshed succesfully",
    accesstoken
})

}



// ================= LOGOUT =================

export async function Logout(req,res) {

const refreshtoken = req.cookies.refreshtoken

if(!refreshtoken){
    return res.status(401).json({
        message:"refresh token not found"
    })
}

const refreshTokenHash = crypto
.createHash("sha256")
.update(refreshtoken)
.digest("hex")

const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked:false
})

if(!session){
    return res.status(400).json({
        message:"session not found"
    })
}

session.revoked = true
await session.save()

res.clearCookie("refreshtoken")

res.status(200).json({
    message:"logged out successfully"
})

}



export async function Logoutall(req,res){

    const refreshtoken=req.cookies.refreshtoken

    if(!refreshtoken){
    return res.status(401).json({
        message:"refresh token not found"
    })
}

const decoded= jwt.verify(refreshtoken,config.JWT_SECRET)

await sessionModel.updateMany({
    id : decoded.id,
    revoked:false
},{
    revoked:true
})

res.clearCookie("refreshtoken")

res.status(200).json({
    message:"logged out from all devices"
})


}