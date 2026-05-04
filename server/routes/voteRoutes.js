const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");

router.post("/cast", voteController.castVote);
router.get("/", voteController.getAllVotes);
router.get("/all", voteController.getAllVotes);
router.get("/election/:electionId", voteController.getVotesByElection);
router.get("/user/:userId", voteController.getVotesByUser);



module.exports = router;
