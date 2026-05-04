const Candidate = require("../models/Candidate");

const addCandidate = async (req, res) => {
try {
    const { name, party, image, blockchainCandidateId } = req.body;

    if (!name || !party || blockchainCandidateId === undefined) {
        return res.status(400).json({
        message: "Name, party, and blockchainCandidateId are required"
    });
    }

    const existingCandidate = await Candidate.findOne({ blockchainCandidateId });

    if (existingCandidate) {
    return res.status(400).json({
        message: "Blockchain Candidate ID already exists"
    });
    }

    const newCandidate = new Candidate({
        name: name.trim(),
        party: party.trim(),
        image: image ? image.trim() : "",
        blockchainCandidateId
    });

    await newCandidate.save();

    res.status(201).json({
        message: "Candidate added successfully",
        candidate: newCandidate
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to add candidate",
        error: error.message
    });
}
};

const getAllCandidates = async (req, res) => {
try {
    const candidates = await Candidate.find();

    res.status(200).json({
        message: "Candidates fetched successfully",
        count: candidates.length,
        candidates
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to fetch candidates",
        error: error.message
    });
}
};

const deleteCandidate = async (req, res) => {
try {
    const { id } = req.params;

    const deletedCandidate = await Candidate.findByIdAndDelete(id);

    if (!deletedCandidate) {
    return res.status(404).json({
        message: "Candidate not found"
    });
    }

    res.status(200).json({
        message: "Candidate deleted successfully"
    });
} catch (error) {
    res.status(500).json({
    message: "Failed to delete candidate",
    error: error.message
    });
}
};

module.exports = {
    addCandidate,
    getAllCandidates,
    deleteCandidate
};