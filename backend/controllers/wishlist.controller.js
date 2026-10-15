const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id)
            .populate({ path: "wishlist", select: "name description price category image stock" });
        const wishlist = (customer?.wishlist || []).filter(Boolean);
        return res.status(200).json({ success: true, count: wishlist.length, wishlist });
    } catch (error) {
        console.error("Fetching wishlist failed:", error);
        return res.status(500).json({ success: false, message: "Unable to load wishlist" });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const customer = await Customer.findById(req.user._id);
        if (customer.wishlist.some((id) => id.toString() === productId)) {
            return res.status(409).json({ success: false, message: "Product is already in your wishlist" });
        }
        customer.wishlist.push(product._id);
        await customer.save();
        return res.status(200).json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        console.error("Adding to wishlist failed:", error);
        return res.status(500).json({ success: false, message: "Unable to update wishlist" });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        const customer = await Customer.findById(req.user._id);
        const index = customer.wishlist.findIndex((id) => id.toString() === productId);
        if (index === -1) {
            return res.status(404).json({ success: false, message: "Product is not in your wishlist" });
        }
        customer.wishlist.splice(index, 1);
        await customer.save();
        return res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        console.error("Removing from wishlist failed:", error);
        return res.status(500).json({ success: false, message: "Unable to update wishlist" });
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
