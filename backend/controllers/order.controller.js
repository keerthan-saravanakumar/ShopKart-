const crypto = require("crypto");
const https = require("https");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const validateShippingAddress = (address) => {
    const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
    if (!address || fields.some((field) => typeof address[field] !== "string" || !address[field].trim())) {
        return "All shipping fields are required";
    }
    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) return "Phone number must contain 10 valid digits";
    if (!/^\d{6}$/.test(address.pincode.trim())) return "Pincode must contain 6 digits";
    return null;
};

const razorpayRequest = (method, path, payload) => new Promise((resolve, reject) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        const error = new Error("Razorpay Test Mode keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env.");
        error.statusCode = 503;
        return reject(error);
    }
    const body = payload ? JSON.stringify(payload) : "";
    const request = https.request({
        hostname: "api.razorpay.com",
        path,
        method,
        headers: {
            Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
            ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } : {})
        }
    }, (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => { raw += chunk; });
        response.on("end", () => {
            let data = {};
            try { data = raw ? JSON.parse(raw) : {}; } catch { /* handled below */ }
            if (response.statusCode < 200 || response.statusCode >= 300) {
                const error = new Error(data.error?.description || "Razorpay request failed");
                error.statusCode = response.statusCode === 401 ? 502 : 502;
                return reject(error);
            }
            resolve(data);
        });
    });
    request.setTimeout(15000, () => request.destroy(new Error("Razorpay request timed out")));
    request.on("error", reject);
    if (payload) request.write(body);
    request.end();
});

const createPaymentOrder = async (req, res) => {
    let order;
    try {
        const shippingAddress = req.body?.shippingAddress;
        const addressError = validateShippingAddress(shippingAddress);
        if (addressError) return res.status(400).json({ success: false, message: addressError });

        const customer = await Customer.findById(req.user._id).populate("cart.product");
        if (!customer || !customer.cart.length) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        const items = [];
        let totalAmount = 0;
        for (const cartItem of customer.cart) {
            const productId = cartItem.product?._id || cartItem.product;
            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ success: false, message: "A product in your cart is no longer available" });
            }
            const product = await Product.findById(productId);
            if (!product) return res.status(400).json({ success: false, message: "A product in your cart no longer exists" });
            if (cartItem.quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }
            items.push({ product: product._id, name: product.name, price: product.price, quantity: cartItem.quantity, image: product.image });
            totalAmount += product.price * cartItem.quantity;
        }

        order = await Order.create({
            user: customer._id,
            items,
            shippingAddress: Object.fromEntries(Object.entries(shippingAddress).map(([key, value]) => [key, value.trim()])),
            totalAmount: Number(totalAmount.toFixed(2)),
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        const razorpayOrder = await razorpayRequest("POST", "/v1/orders", {
            amount: Math.round(order.totalAmount * 100),
            currency: "INR",
            receipt: order._id.toString()
        });
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        if (order?._id) await Order.findByIdAndDelete(order._id).catch(() => {});
        console.error("Creating payment order failed:", error.message);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode === 503 ? error.message : "Unable to create payment order. Please try again."
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId || "")) {
            return res.status(400).json({ success: false, message: "Invalid ShopKart order ID" });
        }
        if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every((value) => typeof value === "string" && value)) {
            return res.status(400).json({ success: false, message: "Payment verification details are required" });
        }

        const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (order.paymentStatus === "PAID") {
            return res.status(200).json({ success: true, message: "Payment already verified", order });
        }
        if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: "Razorpay order does not match" });
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ success: false, message: "Razorpay Test Mode keys are not configured" });
        }

        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
            .digest("hex");
        const expected = Buffer.from(expectedSignature, "hex");
        const received = Buffer.from(razorpay_signature, "hex");
        if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        const customer = await Customer.findById(req.user._id);
        customer.cart = [];
        await customer.save();

        return res.status(200).json({ success: true, message: "Payment verified and order placed", order });
    } catch (error) {
        console.error("Payment verification failed:", error);
        return res.status(500).json({ success: false, message: "Unable to verify payment" });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Fetching orders failed:", error);
        return res.status(500).json({ success: false, message: "Unable to load orders" });
    }
};

const getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Fetching order failed:", error);
        return res.status(500).json({ success: false, message: "Unable to load order" });
    }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById };
