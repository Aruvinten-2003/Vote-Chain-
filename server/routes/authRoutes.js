const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    loginAdmin,
    getAllUsers
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.get("/users", getAllUsers);


module.exports = router;