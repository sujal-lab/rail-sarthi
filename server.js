
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3001;

console.log("🚀 Starting server...");

(async () => {
    try {
        // 🔄 Connect to MongoDB
        await connectDB();

        // 🚀 Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("❌ Server startup failed:");
        console.error(err);
        process.exit(1);
    }
})();