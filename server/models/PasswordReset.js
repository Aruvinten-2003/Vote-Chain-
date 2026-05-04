const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema(

    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        email:{
            type: String,
            required: true,
            trim: true
        },

        resetToken:{
            type:String,
            required: true,
            unique:true
            
        },

        expiresAt: {
            type: Date,
            required: true
    },
        isUsed: {
            type: Boolean,
            default: false
    }
},
{ timestamps: true }

    


);

module.exports = mongoose.model("PasswordReset", passwordResetSchema);
