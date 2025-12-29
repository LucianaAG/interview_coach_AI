import express from "express";
import {
  uploadCvMiddleware,
  uploadCvController
} from "../controllers/upload_cv_controller.js";

const router = express.Router();

router.post(
  "/upload-cv",
  uploadCvMiddleware,
  uploadCvController
);

export default router;
