// ============================================
// Upload Controller
// Handles profile image upload logic
// ============================================

// Upload profile image to Cloudinary
const uploadProfileImage = (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file uploaded. Please select an image.",
            });
        }

        // Return the Cloudinary URL of the uploaded image
        res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully!",
            imageUrl: req.file.path, // Cloudinary URL
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            success: false,
            message: "Image upload failed. Please try again.",
        });
    }
};

module.exports = { uploadProfileImage };
