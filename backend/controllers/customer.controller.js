const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
};

const customerResponse = (customer) => ({
    _id: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone
});

// REGISTER
const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const normalizedName = typeof fullName === "string" ? fullName.trim() : "";
        const normalizedPhone = typeof phone === "string" ? phone.trim() : "";

        if (!normalizedName || !normalizedEmail || typeof password !== "string" || !password || !normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const existingCustomer = await Customer.findOne({ email: normalizedEmail });

        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            fullName: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            phone: normalizedPhone
        });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: customerResponse(customer)
        });

    } catch (error) {
        if (error && error.code === 11000) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        console.error("Customer registration failed:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// LOGIN
const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!normalizedEmail || typeof password !== "string" || !password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const customer = await Customer.findOne({ email: normalizedEmail });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            customer.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(customer._id);

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            customer: customerResponse(customer)
        });

    } catch (error) {
        console.error("Customer login failed:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// GET MY PROFILE
const getMyProfile = async (req, res) => {
    return res.status(200).json({
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone
    });
};


// LOGOUT
const logoutCustomer = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};


// BONUS: CHANGE PASSWORD
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (typeof oldPassword !== "string" || typeof newPassword !== "string" || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must contain at least 6 characters"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            oldPassword,
            req.user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        req.user.password = hashedPassword;
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    registerCustomer,
    loginCustomer,
    getMyProfile,
    logoutCustomer,
    changePassword
};
