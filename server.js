require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Index = require("./router/index");
const ImageRouter = require("./router/ImageRouter");
const MulterRouter = require("./router/multerrouter")
const ProfileRouter = require("./router/ProfileRouter");
const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
        ],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Existing routes
app.use("/", ProfileRouter);

app.use(Index);
app.use("/", ImageRouter);
app.use("/", MulterRouter);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});