import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js"
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

const currency="pkr"
const deliveryCharge=10;
const taxPercentage=0.02

export const placedOderCOD=async(req,res)=>{
    try {
        const { items, address } = req.body;
        const userId=req.userId;

        let subTotal = 0;
        if(items.length === 0){
            return res.json({success:false,message:"Please add product first"})
        }
        for (const item of items) {
          const product = await productModel.findById(item.product);
            if (!product) {
              return res.json({
                success: false,
                message: "Product not found",
              });
            }
          subTotal += product.offerPrice * item.quantity;
        }
        const taxAmount=subTotal * taxPercentage
        const totalAmount = subTotal + taxAmount + deliveryCharge;
        await orderModel.create({
            userId,
            items,
            amount:totalAmount,
            address,
            paymentMethod:"COD"
        })
        await userModel.findByIdAndUpdate(userId,{cartData:{}})
        return res.json({success:true,message:"order placed"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
//stipe 
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.userId;
    const origin = req.headers.origin;

    if (!items || items.length === 0) {
      return res.json({
        success: false,
        message: "Please add product first",
      });
    }

    let subTotal = 0;
    const lineItems = [];

    // Products
    for (const item of items) {
      const product = await productModel.findById(item.product);

      if (!product) {
        return res.json({
          success: false,
          message: "Product not found",
        });
      }

      const price = product.offerPrice;
      subTotal += price * item.quantity;

      // Each product separately
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${product.name} - Size: ${item.size}`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      });
    }

    // Tax
    const taxAmount = subTotal * taxPercentage;

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax",
        },
        unit_amount: Math.round(taxAmount * 100),
      },
      quantity: 1,
    });

    // Delivery Charge
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charge",
        },
        unit_amount: Math.round(deliveryCharge * 100),
      },
      quantity: 1,
    });

    // Total
    const totalAmount = subTotal + taxAmount + deliveryCharge;

    // Create order
    const order = await orderModel.create({
      userId,
      items,
      amount: totalAmount,
      address,
      paymentMethod: "Stripe",
    });

    // Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: lineItems,

      mode: "payment",

      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,

      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    // Clear cart
    await userModel.findByIdAndUpdate(userId, {
      cartData: {},
    });

    return res.json({
      success: true,
      message: "Stripe checkout created",
      url: session.url,
    });

  } catch (error) {
    console.log("STRIPE ERROR:", error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Stripe webhook - verify payment
export const stripeWebhooks = async (request, response) => {
  const signature = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.log("Webhook Error:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const { orderId, userId } = session.metadata;

        console.log("Payment Success");
        console.log("Order ID:", orderId);

        await orderModel.findByIdAndUpdate(orderId, {
          isPaid: true,
        });

        await userModel.findByIdAndUpdate(userId, {
          cartData: {},
        });

        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    response.json({ received: true });
  } catch (error) {
    console.log("Webhook processing error:", error.message);
    response.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//ull order
export const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await orderModel
      .find({ userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};
// all orders data for admin panel =/api/order/list
export const allOrders=async(req,res)=>{
    try {
        const orders = await orderModel
          .find({ $or: [{ paymentMethod: "COD" }, { isPaid: true }] })
          .populate("items.product")
          .sort({ createAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
//updating order status for admin panel=/api/order/status
export const updateStatus=async(req,res)=>{
    try {
        const {orderId,status}=req.body

        await orderModel.findByIdAndUpdate(orderId,{status})
        res.json({success:true,message:"Order status update"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}