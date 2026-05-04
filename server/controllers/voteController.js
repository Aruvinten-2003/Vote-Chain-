const User = require("../models/User");
const VoteRecord = require("../models/VoteRecord");
const Election = require("../models/Election");
const Candidate = require("../models/Candidate");

exports.castVote = async(req,res) =>{
    try{
        const{userId, electionId, candidateId, walletAddress, transactionHash} = req.body;

        if (!userId || !electionId || !candidateId || !walletAddress || !transactionHash){
            return res.status(400).json({message: "All field are required: userId, electionId, candidateId, walletAddress, transactionHash"});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: "This user does not exits"});
        }

        const election = await Election.findById(electionId);
        if(!election){
            return res.status(404).json({message: "This election didn't exist"});
        }

        if(election.status !== "open"){
            return res.status(404).json({message: "This election is  not open for voting"});
        }

        const candidateRecord = await Candidate.findById(candidateId);
        if(!candidateRecord){
            return res.status(404).json({message: "This Candidate didn't exist"});
        }

        const existingVote = await VoteRecord.findOne({userId, electionId});

        if(existingVote){
            return res.status(400).json({message: "User has already voted in this election"});
        }

        const existingTx = await VoteRecord.findOne({ transactionHash });
        if (existingTx) {
            return res.status(400).json({
                message: "Transaction hash already exists"
            });
        }

        const newVote = new VoteRecord({
            userId,
            electionId,
            candidateId,
            walletAddress: walletAddress.trim(),
            transactionHash: transactionHash.trim()
        });

        await newVote.save();

        user.hasVoted = true;
        user.walletAddress = walletAddress.trim();
        await user.save();

        res.status(201).json({
            message: "Vote recorded successfully",
            voteRecord: newVote
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to record vote",
            error: error.message
        });
    }
};

exports.getAllVotes = async (req, res) => {
try {
    const votes = await VoteRecord.find()
        .populate("userId", "fullName email")
        .populate("electionId", "title status")
        .populate("candidateId", "name party")
        .sort({ createdAt: -1 });

    res.status(200).json({
        message: "Vote records fetched successfully",
        count: votes.length,
        votes
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to fetch vote records",
        error: error.message
    });
}
};

exports.getVotesByElection = async (req, res) => {
try {
    const { electionId } = req.params;

    const votes = await VoteRecord.find({ electionId })
        .populate("userId", "fullName email")
        .populate("candidateId", "name party")
        .sort({ createdAt: -1 });

    res.status(200).json({
        message: "Election vote records fetched successfully",
        count: votes.length,
        votes
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to fetch election vote records",
        error: error.message
    });
}
};

exports.getVotesByUser = async (req, res) => {
try {
    const { userId } = req.params;

    const votes = await VoteRecord.find({ userId })
        .populate("userId", "fullName email")
        .populate("candidateId", "name party")
        .sort({ createdAt: -1 });

    res.status(200).json({
        message: "User vote records fetched successfully",
        count: votes.length,
        votes
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to fetch user vote records",
        error: error.message
    });
}
};
