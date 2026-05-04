require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const { hashPassword } = require("../utils/password");

function getArg(name) {
    const prefix = `--${name}=`;
    const arg = process.argv.find((value) => value.startsWith(prefix));
    return arg ? arg.slice(prefix.length).trim() : "";
}

async function main() {
    const fullName = getArg("name") || process.env.ADMIN_NAME || "System Admin";
    const email = getArg("email") || process.env.ADMIN_EMAIL;
    const password = getArg("password") || process.env.ADMIN_PASSWORD;

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing in .env");
    }

    if (!email || !password) {
        throw new Error(
            "Admin email and password are required. Use --email=admin@example.com --password=yourPassword"
        );
    }

    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await hashPassword(password);

    const admin = await User.findOneAndUpdate(
        { email: email.trim() },
        {
            fullName: fullName.trim(),
            email: email.trim(),
            password: hashedPassword,
            role: "admin",
            hasVoted: false
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        }
    ).select("-password");

    console.log("Admin account ready:");
    console.log(admin);
}

main()
    .catch((error) => {
        console.error("Failed to create admin:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
