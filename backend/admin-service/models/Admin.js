const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AdminSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        businessName: { type: String, required: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// Şifreyi kaydetmeden önce hashle
AdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Şifre doğrulama metodu
AdminSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);