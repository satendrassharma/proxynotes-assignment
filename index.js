const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("database connected");
});

//middleware
app.use(
  cors({
    exposedHeaders: ["Content-Length", "x-auth-token"]
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/api/auth", require("./api/routes/auth"));
app.use("/api/media", require("./api/routes/media"));

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  return res
    .status(error.status || 500)
    .json({ errors: [{ msg: error.message }] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server listening at " + PORT);
});
