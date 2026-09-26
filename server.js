const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const indexRouter = require("./router");

const multerrouter = require("./router");

const Session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(Session);

dotenv.config();

const app = express();

// =========================
// CORS
// =========================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

// =========================
// JSON
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// SESSION STORE
// =========================

const store = new MongoDBSession({
  uri: process.env.MONGO_URI,
  collection: "session",
});

// =========================
// SESSION
// =========================

app.use(
  Session({
    secret: process.env.Session_key,

    resave: false,

    saveUninitialized: false,

    store: store,

    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

// =========================
// ROUTES
// =========================

app.use("/", indexRouter);

app.use("/", multerrouter);

// =========================
// MONGODB
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MONGODB is connected");
  })
  .catch((error) => {
    console.log("MONGODB connection error:", error);
  });

// =========================
// SERVER
// =========================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});