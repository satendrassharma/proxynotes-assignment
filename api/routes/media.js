const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary");
const auth = require("../../middleware/auth");
const Media = require("../../models/Media");
require("../../cloudinary");
const upload = multer({
  storage: multer.diskStorage({}),
  limits: { files: 1 }
});

const getfilename = filename => {
  const fn = filename.substring(0, filename.length - 4);
  return `${fn}_${Date.now()}`;
};

//upload
router.post("/upload", auth, upload.single("video"), async (req, res) => {
  // console.log(req.user);
  if (req.file.mimetype !== "video/mp4") {
    return res
      .status(422)
      .json({ errors: [{ msg: "video should of format mp4" }] });
  }

  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      resource_type: "video",
      public_id: `user_videos/${getfilename(req.file.originalname)}`
    });

    const url = result.secure_url;
    const media = new Media({
      user: req.user.id,
      url
    });
    const newmedia = await media.save();
    return res.json({ msg: "video uploaded successful", newmedia });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: err.message }] });
  }
});

//get all media of authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const medias = await Media.find({ user: req.user.id }, "url");
    return res.json(medias);
  } catch (err) {
    return res.status(500).json({
      errors: [{ msg: err.message }]
    });
  }
});

module.exports = router;
