const express = require("express");
const {
    registerAdmin,
    loginAdmin,
    updateAdmin,
    deleteAdmin,
} = require("../controllers/AdminController");
const { verifyToken } = require("../middleware/auth"); // Middleware'i içe aktar
const router = express.Router();

// Admin Kayıt
router.post("/register", registerAdmin);

// Admin Giriş
router.post("/login", loginAdmin);

// Token doğrulaması gerektiren rotalar
router.put("/:id", verifyToken, updateAdmin); // Admin Bilgilerini Güncelle
router.delete("/:id", verifyToken, deleteAdmin); // Admin Sil

module.exports = router;
