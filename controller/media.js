const Media = require("../models/Media");
const cloudinary = require("cloudinary");
const util = require("../util");
require("../cloudinary");

const uploadVideo = async (req, res) => {
  if (req.file.mimetype !== "video/mp4") {
    return res
      .status(422)
      .json({ errors: [{ msg: "video should of format mp4" }] });
  }

  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      resource_type: "video",
      public_id: `user_videos/${util.getfilename(req.file.originalname)}`
    });

    const url = result.secure_url;
    const media = new Media({
      user: req.user.id,
      url
    });
    const newmedia = await media.save();
    return res.json({ msg: "video uploaded successful", media: newmedia });
  } catch (err) {
    console.log(err);
    if (err.error) {
      return res
        .status(err.error.http_code)
        .json({ errors: [{ msg: err.error.message }] });
    }
    return res.status(500).json({ errors: [{ msg: err.message }] });
  }
};

const getAllMedia = async (req, res) => {
  try {
    const medias = await Media.find({ user: req.user.id }, "url");
    return res.json(medias);
  } catch (err) {
    return res.status(500).json({
      errors: [{ msg: err.message }]
    });
  }
};

module.exports = {
  uploadVideo,
  getAllMedia
};
