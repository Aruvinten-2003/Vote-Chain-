const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(

    {
        fullName:{
            type: String,
            required: true,
            trim: true
        },

        email:{
            type:String,
            required: true,
            unique: true,
            trim: true
        },

        password:{
            type: String,
            required: true
        },

        role:{
            type:String,
            enum:["admin", "voter"],
            default: "voter"
        },

        walletAddress:{
            type:String,
            default: ""
        },

        hasVoted:{
            type:Boolean,
            default: false
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);