require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./src/config/db");
const socketHandler = require("./src/sockets/socketHandler");

const PORT = process.env.PORT || 3001;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

// Run Socket Logic
socketHandler(io);

console.log("🚀 Starting server...");

(async () => {
    try {
        // 🔄 Connect to MongoDB
        await connectDB();

        // 🚀 Start server
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.io initialized`);
        });

    } catch (err) {
        console.error("❌ Server startup failed:");
        console.error(err);
        process.exit(1);
    }
})();