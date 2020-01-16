const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store: new MongoStore({ mongooseConnection: db }),
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 600000 },
    resave: false,
    saveUninitialized: false
  })
);

//routes
app.use("/api/auth", require("./api/routes/auth"));
app.use("/api/media", require("./api/routes/media"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("server listening at " + PORT);
});
