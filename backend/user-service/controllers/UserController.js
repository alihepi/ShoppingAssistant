const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "E-posta zaten kullanılıyor." });

        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ message: "Kullanıcı adı zaten kullanılıyor." });

        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu.", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı e-posta ile bul
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        // Şifreyi doğrula
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Geçersiz şifre." });
        }

        // JWT oluştur
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Tokenin geçerlilik süresi
        );

        // Kullanıcı bilgileriyle yanıt dön
        res.status(200).json({
            message: "Başarıyla giriş yapıldı.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                favorites: user.favorites,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { currentPassword, newPassword, ...otherUpdates } = req.body;
        const userId = req.params.id;

        // Kullanıcıyı bul
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        // Eğer şifre güncellemesi varsa
        if (currentPassword && newPassword) {
            // Mevcut şifreyi doğrula
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Mevcut şifre yanlış." });
            }

            // Yeni şifreyi hashle
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            otherUpdates.password = hashedNewPassword;
        }

        // Kullanıcıyı güncelle
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: otherUpdates },
            { new: true }
        );

        // Hassas bilgileri çıkar
        const userResponse = {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            favorites: updatedUser.favorites,
        };

        res.status(200).json({ 
            message: "Bilgiler başarıyla güncellendi.", 
            user: userResponse 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Kullanıcı başarıyla silindi." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Diğer fonksiyonlar (favoriler ekleme/silme)
module.exports = {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
};