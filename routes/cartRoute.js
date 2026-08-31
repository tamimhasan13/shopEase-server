
import express from 'express';
import authUser from '../middlewares/userAuth.js';
import { addProduct } from '../controllers/productController.js';
import { addToCart, removeFromCart, updateCart } from '../controllers/cartController.js';

const cartRouter=express.Router()
cartRouter.post('/add',authUser,addToCart)
cartRouter.post('/update',authUser,updateCart)
cartRouter.post("/remove", authUser, removeFromCart);

export default cartRouter;