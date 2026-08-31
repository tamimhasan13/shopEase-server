import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDatabase from "./config/db.js";
import userRoute from "./routes/userRoute.js";
import adminRouter from "./routes/adminRoute.js";
import connectionCloudinary from "./config/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();

const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(
  cors({
    origin:process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", userRoute);
app.use("/api/admin", adminRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-commerce API is running...",
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    await connectionCloudinary();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
