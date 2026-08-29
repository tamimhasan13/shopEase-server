import jwt from "jsonwebtoken"
const cookieOptions = {
  httpOnly: true,
  secure: process.env.APP_ENV === "production",
  sameSite: process.env.APP_ENV === "production" ? "none" : "strict",
};
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASS
    ) {
      const adminToken = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("adminToken", adminToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "admin login success ",
      });
    }
     return res.json({
       success: false,
       message: "Invalid email or password",
     });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const isAdminAuth= async(req,res)=>{
    try {
        return res.json({success:true,message: "Admin is authenticated"})
        
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

export const adminLogout=async(req,res)=>{
    try {
        res.clearCookie("adminToken",cookieOptions)
        return res.json({success:true,message:"admin logged out"})
    } catch (error) {
        console.log(error.message);
    res.json({success:true,message:error.message})
    }
}

