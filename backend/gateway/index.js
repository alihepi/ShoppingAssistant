const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require("dotenv");
var cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Mikroservis URL'leri
const USER_SERVICE_URL = "http://localhost:5001/api/users";
const ADMIN_SERVICE_URL = "http://localhost:5002/api/admins";
const CHATBOT_SERVICE_URL = "http://localhost:5025/api/chatbot";

app.use(cors());

// Chatbot Servisine Yönlendirme
app.use(
    "/api/chatbot",
    createProxyMiddleware({
        target: CHATBOT_SERVICE_URL,
        changeOrigin: true,
    })
);


// Kullanıcı Servisine Yönlendirme
app.use(
    "/api/users",
    createProxyMiddleware({
        target: USER_SERVICE_URL,
        changeOrigin: true,
    })
);

// Admin Servisine Yönlendirme
app.use(
    "/api/admins",
    createProxyMiddleware({
        target: ADMIN_SERVICE_URL,
        changeOrigin: true,
    })
);

app.get("/", (req, res) => {
    res.send("API Gateway is running.");
});

app.listen(PORT, () => console.log(`API Gateway listening on port ${PORT}`));
