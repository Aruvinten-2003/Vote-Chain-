const express = require("express");
const router = express.Router();

const candidateController = require("../controllers/candidateController");

router.post("/", candidateController.addCandidate);
router.post("/add", candidateController.addCandidate);
router.get("/", candidateController.getAllCandidates);
router.delete("/:id", candidateController.deleteCandidate);

module.exports = router;
