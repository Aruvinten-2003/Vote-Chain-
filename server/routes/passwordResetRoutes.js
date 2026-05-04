const express = require("express");
const router = express.Router();
const passwordResetController = require("../controllers/passwordResetController");

router.post("/forgot-password", passwordResetController.forgotPassword);
router.post("/request-reset", passwordResetController.forgotPassword);
router.post("/reset-password", passwordResetController.resetPassword);
router.get("/", passwordResetController.getAllResetRequests);

module.exports = router;
