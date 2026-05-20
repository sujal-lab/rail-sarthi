// ============================================
// Multer Middleware (with Cloudinary Storage)
// Handles file upload and stores directly to Cloudinary
// ============================================

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Setup Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "rail-sarthi/profiles", // Cloudinary folder name
        allowed_formats: ["jpg", "jpeg", "png"], // Only allow image formats
    },
});

// Create Multer upload instance
const upload = multer({ storage: storage });

module.exports = upload;
