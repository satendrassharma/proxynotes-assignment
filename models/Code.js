const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CodeSchema = new Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  time: { type: String, required: true }
});

module.exports = mongoose.model("Code", CodeSchema);
