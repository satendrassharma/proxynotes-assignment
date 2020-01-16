const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MediaSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  url: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Media", MediaSchema);
