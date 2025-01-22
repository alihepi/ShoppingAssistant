const express = require("express");
const {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
} = require("../controllers/UserController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

module.exports = router;