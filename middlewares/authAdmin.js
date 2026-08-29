import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
    const { adminToken } = req.cookies;
    if (!adminToken) {
      return res.json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }
  try {
    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
    // req.user = decoded;
    if(decoded.email === process.env.ADMIN_EMAIL){
        next();
    }
    else{
        return res.json({
          success: false,
          message: "Not authorized. Please login.",
        });
    }

    
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authAdmin;
