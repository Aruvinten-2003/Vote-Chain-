const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voteRecordSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Election",
        required: true
    },

    candidateId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required:true,
    },

    walletAddress:{
        type:String,
        required:true,
        trim: true
    },

    transactionHash: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    votedAt: {
        type: Date,
        default: Date.now
    }
},
{ timestamps: true }
);




module.exports = mongoose.model("VoteRecord", voteRecordSchema);
