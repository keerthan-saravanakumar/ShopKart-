const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const populatedCart = async (customerId) => {
    const customer = await Customer.findById(customerId).populate({
        path: "cart.product",
        select: "name description price category image stock"
    });
    return (customer?.cart || [])
        .filter((item) => item.product)
        .map((item) => ({ product: item.product, quantity: item.quantity }));
};

const getCart = async (req, res) => {
    try {
        const cart = await populatedCart(req.user._id);
        return res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error("Fetching cart failed:", error);
        return res.status(500).json({ success: false, message: "Unable to load your cart" });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        if (product.stock < 1) return res.status(400).json({ success: false, message: "This product is out of stock" });

        const customer = await Customer.findById(req.user._id);
        const item = customer.cart.find((entry) => entry.product.toString() === productId);
        const nextQuantity = item ? item.quantity + 1 : 1;
        if (nextQuantity > product.stock) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} units are available` });
        }
        if (item) item.quantity = nextQuantity;
        else customer.cart.push({ product: product._id, quantity: 1 });
        await customer.save();
        return res.status(200).json({ success: true, message: "Cart updated", cart: await populatedCart(customer._id) });
    } catch (error) {
        console.error("Adding to cart failed:", error);
        return res.status(500).json({ success: false, message: "Unable to update your cart" });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be a whole number of at least 1" });
        }
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} units are available` });
        }
        const customer = await Customer.findById(req.user._id);
        const item = customer.cart.find((entry) => entry.product.toString() === productId);
        if (!item) return res.status(404).json({ success: false, message: "Product is not in your cart" });
        item.quantity = quantity;
        await customer.save();
        return res.status(200).json({ success: true, message: "Cart quantity updated", cart: await populatedCart(customer._id) });
    } catch (error) {
        console.error("Updating cart failed:", error);
        return res.status(500).json({ success: false, message: "Unable to update your cart" });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        const customer = await Customer.findById(req.user._id);
        const index = customer.cart.findIndex((entry) => entry.product.toString() === productId);
        if (index === -1) return res.status(404).json({ success: false, message: "Product is not in your cart" });
        customer.cart.splice(index, 1);
        await customer.save();
        return res.status(200).json({ success: true, message: "Product removed from cart", cart: await populatedCart(customer._id) });
    } catch (error) {
        console.error("Removing from cart failed:", error);
        return res.status(500).json({ success: false, message: "Unable to update your cart" });
    }
};

module.exports = { getCart, addToCart, updateCartQuantity, removeFromCart };
