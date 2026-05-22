import express from "express";
import Listing from "../models/Listing.js";
import {
  createListing,
  getAllListings,
  getListingById,
  deleteListing,
  updateProperty,
  updateDescription,
  updateAmenities,
  updateActivities,
  updatePhotos,
  deletePhoto,
   reorderPhotos,
  updateVideo,
  updateRates,
  updateLocation ,
  publishListing,
  deleteRate,
   addReview,
  publishReview,
  replyReview,
  deleteReview,
   addExtraFee,
  editExtraFee,
  deleteExtraFee,
  editRate,
  toggleListingStatus,
  getPublishedListings,
  getAllReviews,

  

} from "../controllers/listingController.js";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
// import path from "path";
import { isAuth, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});


router.get("/published", getPublishedListings);
router.get("/reviews", getAllReviews); 
router.get("/public", async (req, res) => {
  try {
    const listings = await Listing.find().select("_id property.title");
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// TEMP (no auth)
router.post("/", createListing);

router.get("/", isAuth, isAdmin, getAllListings);
router.get("/:id", getListingById); 
router.delete("/:id", deleteListing);
 

// tab-wise save
router.put("/:id/property", updateProperty);
router.put("/:id/description", updateDescription);
router.put("/:id/amenities", updateAmenities);
router.put("/:id/activities", updateActivities);
router.put(
  "/:id/photos",
  upload.array("photos", 30),
  updatePhotos
);
router.delete("/:id/photos/:filename", deletePhoto);
router.put(
  "/:id/photos/reorder",
  reorderPhotos
);
router.put("/:id/video", updateVideo);
router.put("/:id/rates", updateRates);
router.put("/:id/rates/delete", deleteRate);
router.put("/:id/rates/edit", editRate);
router.put("/:id/location", updateLocation);


router.put("/:id/publish", publishListing);

//! Reviews Route 
router.post("/:id/reviews", addReview);

router.put("/:id/reviews/:reviewId/publish", publishReview);
router.put("/:id/reviews/:reviewId/reply", replyReview);
router.delete("/:id/reviews/:reviewId", deleteReview);


//! EXTRA FEES
router.put("/:id/extra-fees", addExtraFee);
router.put("/:id/extra-fees/edit", editExtraFee);
router.put("/:id/extra-fees/delete", deleteExtraFee);

router.put(
  "/:id/toggle-status",
  isAuth,
  isAdmin,
  toggleListingStatus
);




export default router;
  