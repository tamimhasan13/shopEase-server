import express from "express"
import { isAuth, userLogin, userLogout, userRegister } from "../controllers/userController.js"
import authUser from "../middlewares/userAuth.js"

const userRoute=express.Router()
userRoute.post('/register',userRegister)
userRoute.post('/login',userLogin)
userRoute.post('/logout',userLogout)
userRoute.get('/is-auth' ,authUser,isAuth)

export default userRoute;