const crypto = require("crypto");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const { hashPassword } = require("../utils/password");

exports.forgotPassword = async (req, res) =>{
    try{
        const{email} = req.body;

        if(!email){
            return res.status(400).json({message:" Email is required"});
        }

        const user = await User.findOne({email:email.trim()});

        if (!user){
            return res.status(404).json({message: "No user found with this email"});
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const passwordReset = new PasswordReset({
            userId: user._id,
            email: user.email,
            resetToken,
            expiresAt,
            isUsed: false
        });

        await passwordReset.save();

        res.status(200).json({
            message: "Password reset token generated successfully",
            resetToken,
            expiresAt
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to process forgot password request",
            error: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({
        message: "Reset token and new password are required"
    });
    }

    const resetRecord = await PasswordReset.findOne({ resetToken });

    if (!resetRecord) {
        return res.status(404).json({
        message: "Invalid reset token"
    });
    }

    if (resetRecord.isUsed) {
    return res.status(400).json({
        message: "This reset token has already been used"
    });
    }

    if (new Date() > resetRecord.expiresAt) {
    return res.status(400).json({
        message: "Reset token has expired"
});
    }

    const user = await User.findById(resetRecord.userId);

    if (!user) {
        return res.status(404).json({
        message: "User not found"
    });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    resetRecord.isUsed = true;
    await resetRecord.save();

    res.status(200).json({
        message: "Password has been reset successfully"
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to reset password",
        error: error.message
    });
}
};

exports.getAllResetRequests = async (req, res) => {
try {
    const resetRequests = await PasswordReset.find().sort({ createdAt: -1 });

    res.status(200).json({
        message: "Password reset requests fetched successfully",
        count: resetRequests.length,
        resetRequests
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to fetch password reset requests",
        error: error.message
    });
}
};

