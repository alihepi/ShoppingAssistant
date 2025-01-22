const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Loglama Middleware'i
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use(cors());

// Middleware ve rotalar
app.use(express.json());

// User Service için rota tanımlama
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`User Service listening on port ${PORT}`));
    })
    .catch(err => console.error("MongoDB connection error:", err));
