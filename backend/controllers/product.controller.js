const mongoose = require("mongoose");
const Product = require("../models/product.model");

// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !category || !image) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (price === undefined || price === null || typeof price !== "number" || price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0"
            });
        }

        if (stock === undefined || stock === null || typeof stock !== "number" || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative"
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        });

        return res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Product creation failed:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// GET ALL PRODUCTS (with search & category filtering + bonus sorting)
const getAllProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;

        const query = {};

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        if (category) {
            query.category = category;
        }

        let sortOption = {};

        if (sort === "price_asc") {
            sortOption.price = 1;
        } else if (sort === "price_desc") {
            sortOption.price = -1;
        }

        const products = await Product.find(query)
            .select("name price category image stock")
            .sort(sortOption);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Fetching products failed:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Fetching product failed:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createProduct,
    getAllProducts,
    getProductById
};
