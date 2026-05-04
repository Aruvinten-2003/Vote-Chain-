const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');

router.post("/create", electionController.createElection);
router.get("/", electionController.getAllElections);
router.get("/current", electionController.getCurrentElection);
router.put("/open/:id", electionController.openElection);
router.put("/close/:id", electionController.closeElection);
router.delete("/:id", electionController.deleteElection);


module.exports = router