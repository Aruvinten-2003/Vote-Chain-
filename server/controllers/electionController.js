const Election = require("../models/Election");

exports.createElection = async (req, res) => {
try {
    const { title, description, startDate, endDate } = req.body;

    if (!title) {
        return res.status(400).json({
        message: "Election title is required"
    });
    }

    const newElection = new Election({
        title: title.trim(),
        description: description ? description.trim() : "",
        startDate: startDate || null,
        endDate: endDate || null,
        status: "upcoming"
    });

    await newElection.save();

    res.status(201).json({
        message: "Election created successfully",
        election: newElection
    });
} catch (error) {
    res.status(500).json({
        message: "Failed to create election",
        error: error.message
    });
}
};

exports.getAllElections = async (req, res) => {
try {
    const elections = await Election.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Elections fetched successfully",
      count: elections.length,
      elections
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch elections",
      error: error.message
    });
  }
};

exports.getCurrentElection = async (req, res) => {
  try {
    const election = await Election.findOne().sort({ createdAt: -1 });

    if (!election) {
      return res.status(404).json({
        message: "No election found"
      });
    }

    res.status(200).json({
      message: "Current election fetched successfully",
      election
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch current election",
      error: error.message
    });
  }
};

exports.openElection = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    election.status = "open";
    await election.save();

    res.status(200).json({
      message: "Election opened successfully",
      election
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to open election",
      error: error.message
    });
  }
};

exports.closeElection = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    election.status = "closed";
    await election.save();

    res.status(200).json({
      message: "Election closed successfully",
      election
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to close election",
      error: error.message
    });
  }
};

exports.deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedElection = await Election.findByIdAndDelete(id);

    if (!deletedElection) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    res.status(200).json({
      message: "Election deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete election",
      error: error.message
    });
  }
};