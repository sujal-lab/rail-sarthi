// ============================================
// Upload Routes
// POST /api/upload/profile - Upload profile image
// ============================================

const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { uploadProfileImage } = require("../controllers/uploadController");

// POST /api/upload/profile — Single image upload
router.post("/profile", upload.single("profileImage"), uploadProfileImage);

module.exports = router;
