// config/db.js

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("🔄 Connecting to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:");
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;