import app from "./src/app.js";
import connectDB from "./src/config/database.js";

app.listen(3000,()=>{
    console.log("sever is stared");
})

connectDB();

