import { Router } from "express";
import * as authcontroller from "../controllers/auth.controller.js"
    const authRouter=Router();


    authRouter.post("/register",authcontroller.register)

    authRouter.post("/login",authcontroller.Login)

    authRouter.get("/Get-me",authcontroller.Get_me)

    authRouter.get("/refresh-token",authcontroller.refreshtoken)

    authRouter.get("/Logout",authcontroller.Logout)

    authRouter.get("/Logout-all",authcontroller.Logoutall)

    export default authRouter;