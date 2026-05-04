const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required:true,
            trim: true
        },

        description:{
            type: String,
            default:"",
            trim: true
        },

        status:{
            type: String,
            enum:["upcoming", "open", "closed"],
            default: "upcoming"
        },

        startDate:{
            type:Date,
            default:null

        },

        endDate:{
            type:Date,
            default:null

        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Election", electionSchema);
