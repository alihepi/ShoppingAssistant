const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Admin Kayıt
exports.registerAdmin = async (req, res) => {
    try {
        const { username, businessName, password } = req.body;

        const admin = new Admin({ username, businessName, password });
        await admin.save();

        res.status(201).json({ message: "Admin başarıyla oluşturuldu.", admin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Giriş
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Admin kontrolü
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(404).json({ message: "Admin bulunamadı." });
        }

        // Şifre doğrulama
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Geçersiz şifre." });
        }

        // JWT oluştur
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Başarıyla giriş yapıldı.",
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                businessName: admin.businessName,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Bilgilerini Güncelle
exports.updateAdmin = async (req, res) => {
    try {
        const { currentPassword, newPassword, ...otherUpdates } = req.body;
        const adminId = req.params.id;

        // Admin'i bul
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin bulunamadı." });
        }

        // Eğer şifre güncellemesi varsa
        if (currentPassword && newPassword) {
            // Mevcut şifreyi doğrula
            const isPasswordValid = await admin.comparePassword(currentPassword);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Mevcut şifre yanlış." });
            }

            // Yeni şifreyi hashle
            otherUpdates.password = await bcrypt.hash(newPassword, 10);
        }

        // Admin'i güncelle
        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { $set: otherUpdates },
            { new: true }
        );

        // Hassas bilgileri çıkar
        const adminResponse = {
            id: updatedAdmin._id,
            username: updatedAdmin.username,
            businessName: updatedAdmin.businessName,
        };

        res.status(200).json({ 
            message: "Bilgiler başarıyla güncellendi.", 
            admin: adminResponse 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Sil
exports.deleteAdmin = async (req, res) => {
    try {
        await Admin.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Admin başarıyla silindi." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
