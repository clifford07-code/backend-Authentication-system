import dotenv from "dotenv";   
import { Error } from "mongoose";

dotenv.config();

if(!process.env.MONGO_URI){
    throw new Error("there is no mongo uri in env");
    }
if(!process.env.JWT_SECRET){
    throw new Error("there is no jwt secret in env");
    }

const config={
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET
}

export default config