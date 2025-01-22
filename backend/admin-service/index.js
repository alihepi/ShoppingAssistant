const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Loglama Middleware'i
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use(cors());

// Middleware ve rotalar
app.use(express.json());
app.use("/api/admins", require("./routes/adminRoutes"));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Admin Service listening on port ${PORT}`));
    })
    .catch(err => console.error(err));