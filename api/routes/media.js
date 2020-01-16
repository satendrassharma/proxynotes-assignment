const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../../middleware/auth");
const MediaController = require("../../controller/media");

const upload = multer({
  storage: multer.diskStorage({}),
  limits: { files: 1 }
});

//upload
router.post(
  "/upload",
  auth,
  upload.single("video"),
  MediaController.uploadVideo
);

//get all media of authenticated user
router.get("/", auth, MediaController.getAllMedia);

module.exports = router;
