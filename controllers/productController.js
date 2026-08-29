import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

export const addProduct = async (req,res) => {
  try {
    const productData=JSON.parse(req.body.productData);
    const images=req.files;
    const imagesUrl=await Promise.all(
        images.map(async(item)=>{
            let result= await cloudinary.uploader.upload(item.path,{resource_type:"image"})
            return result.secure_url
        })
    )
    const product=await productModel.create({...productData,image:imagesUrl});
    res.json({ success: true, message: "product added", product });

  } catch (error) {
    console.log(error.message)
    res.json({success:false,message:error.message})
  }
};
export const listProduct = async (req,res) => {
  try {
    const products=await productModel.find({})
    res.json({success:true,products})
  } catch (error) {
    console.log(error.message)
    res.json({success:false,message:error.message})
  }
};
export const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
export const changeStockProduct = async (req,res) => {
  try {
    const {productId,inStock}=req.body
    await productModel.findByIdAndUpdate(productId,{inStock})
    res.json({success:true,message:"stock Update"})
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
