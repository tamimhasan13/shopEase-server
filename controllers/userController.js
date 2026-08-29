import userModel from "../models/userModel.js";
import validator from "validator"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
const cookieOptions = {
  httpOnly: true,
  secure: process.env.APP_ENV === "production",
  sameSite: process.env.APP_ENV === "production" ? "none" : "strict",
};
export const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "user already exits" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if(password.length <8){
        return res.json({ success: false, message: "Please enter a strong password"});
    }
    const hashedPassword=await bcrypt.hash(password,10);
    const newUser=new userModel({
        name,
        email,
        password:hashedPassword
    })
    const user= await newUser.save()
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{expiresIn:"7d"});
    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
    return res.json({success:true,user:{email:user.email,name:user.name}})

  } catch (error) {
    console.log(error.message);
    res.json({success:true,message:error.message})
  }
};
//user login 
export const userLogin=async(req,res)=>{
    try {
        const {email,password}=req.body;
        const user=await userModel.findOne({email});
        if(!user){
           return res.json({success:false,message:"user dose`t exits"})
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if (!isMatch) {
          return res.json({
            success: false,
            message: "Invalid password",
          });
        }
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });
          res.cookie("token", token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
          return res.json({
            success: true,
            user: { email: user.email, name: user.name },
          });
          

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const isAuth= async(req,res)=>{
    try {
        const {userId}=req
        const user= await userModel.findById(userId).select("-password")
        return res.json({ success: true, user, cartData: user.cartData || {} });
        
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

export const userLogout=async(req,res)=>{
    try {
        res.clearCookie("token",cookieOptions)
        return res.json({success:true,message:"successfully  logged out"})
    } catch (error) {
        console.log(error.message);
    res.json({success:false,message:error.message})
    }
}
