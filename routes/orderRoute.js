
import express from 'express';
import authAdmin from '../middlewares/authAdmin.js';
import { allOrders, placedOderCOD, placeOrderStripe, updateStatus, userOrders } from '../controllers/orderController.js';
import authUser from '../middlewares/userAuth.js';

const orderRouter=express.Router()
//for admin
orderRouter.post('/list',authAdmin,allOrders)
orderRouter.post('/status',authAdmin,updateStatus)
// for payment
orderRouter.post('/cod',authUser,placedOderCOD)
orderRouter.post('/stripe',authUser,placeOrderStripe)
// for user
orderRouter.get('/userOrders', authUser,userOrders)
export default orderRouter;