import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
      return res.json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    if(decoded.id){
        req.userId=decoded.id;
    }
    else{
        return res.json({
          success: false,
          message: "Not authorized. Please login.",
        });
    }

    next();
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authUser;
