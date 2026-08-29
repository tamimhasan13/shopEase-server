import userModel from "../models/userModel.js";
import { userRegister } from './userController.js';

export const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = req.userId;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const cartData = userData.cartData || {};

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    return res.json({
      success: true,
      message: "Product added to cart",
      cartData,
    });
  } catch (error) {
    console.log(error.message);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCart=async(req,res)=>{
    try {
        const {itemId,size,quantity}=req.body
        const userId=req.userId
        const userData = await userModel.findById(userId);
        const cartData = await userData.cartData;
        cartData[itemId][size]=quantity

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "update to cartData" });
    } catch (error) {
        
    }
}