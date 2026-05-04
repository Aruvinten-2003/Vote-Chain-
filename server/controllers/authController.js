const User = require("../models/User");
const {
    comparePassword,
    hashPassword,
    isPasswordHash
} = require("../utils/password");

exports.registerUser = async (req, res) => {
try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({
        message: "Full name, email, and password are required"
    });
    }

    const existingUser = await User.findOne({ email: email.trim() });

    if (existingUser) {
        return res.status(400).json({
        message: "Email already exists"
    });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
        fullName: fullName.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: "voter"
    });

    await newUser.save();

    res.status(201).json({
    message: "User registered successfully",
    user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
    }
    });
} catch (error) {
    res.status(500).json({
        message: "Registration failed",
        error: error.message
    });
}
};

exports.loginUser = async (req, res) => {
try {
    const { email, password } = req.body;

    if (!email || !password) {
    return res.status(400).json({
        message: "Email and password are required"
    });
    }

    const user = await User.findOne({ email: email.trim() });

    if (!user) {
        return res.status(404).json({
        message: "User not found"
    });
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
    return res.status(401).json({
        message: "Invalid password"
    });
    }

    if (user.role !== "voter") {
        return res.status(403).json({
        message: "This login is for voters only"
        });
    }

    if (!isPasswordHash(user.password)) {
        user.password = await hashPassword(password);
        await user.save();
    }

    res.status(200).json({
        message: "Voter login successful",
        user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        hasVoted: user.hasVoted
    }
    });
} catch (error) {
    res.status(500).json({
        message: "Login failed",
        error: error.message
    });
}
};

exports.loginAdmin = async (req, res) => {
try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
        message: "Email and password are required"
        });
    }

    const admin = await User.findOne({ email: email.trim() });

    if (!admin) {
        return res.status(404).json({
        message: "Admin account not found"
        });
    }

    const passwordMatches = await comparePassword(password, admin.password);

    if (!passwordMatches) {
        return res.status(401).json({
        message: "Invalid password"
        });
    }

    if (admin.role !== "admin") {
        return res.status(403).json({
        message: "Access denied. Not an admin account"
        });
    }

    if (!isPasswordHash(admin.password)) {
        admin.password = await hashPassword(password);
        await admin.save();
    }

    res.status(200).json({
        message: "Admin login successful",
        user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
    }
    });
} catch (error) {
    res.status(500).json({
        message: "Admin login failed",
        error: error.message
    });
}
};

exports.getAllUsers = async (req, res) => {
try {
    const users = await User.find().select("-password");

    res.status(200).json({
        message: "Users fetched successfully",
        count: users.length,
        users
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to fetch users",
        error: error.message
    });
}
};
