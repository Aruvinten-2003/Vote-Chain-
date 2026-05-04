const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },
    party: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: ""
    },
    blockchainCandidateId: {
        type: Number,
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
