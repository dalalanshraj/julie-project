import express from "express";
import multer from "multer";
import {
  uploadImage,
  getAllImages,
  getPublishedImages,
  toggleStatus,
  deleteImage,
  reorderGallery,
} from "../controllers/galleryController.js";
import sharp from "sharp";

const router = express.Router();

// STORAGE
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// const upload = multer({ storage });

// ROUTES
router.post(
  "/",
  upload.array("images", 30),
  uploadImage
);
router.get("/", getAllImages);
router.get("/published", getPublishedImages);
router.put("/:id/toggle", toggleStatus);
router.delete("/:id", deleteImage);
router.put("/reorder", reorderGallery);

export default router;