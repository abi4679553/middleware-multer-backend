const express = require("express");
const multer = require("multer");
const path = require("path");

const MulterRouter = express.Router();


// Storage
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "upload/");
    },

    filename: (req, file, cb) => {
        cb(
            null,
            "image-" +
            Date.now() +
            path.extname(file.originalname)
        );
    }
});


// Allow only image files
const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        ".jpg",
        ".jpeg",
        ".png"
    ];
    const ext = path.extname(file.originalname) .toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG and PNG images are allowed"));
    }

};


// Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});


// SINGLE IMAGE UPLOAD
MulterRouter.post(
    "/upload-image",
    upload.single("image"),
    (req, res) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please select an image"
                });
            }

            console.log("Uploaded File:", req.file);

            res.json({
                success: true,
                message: "Image uploaded successfully",
                fileUrl: `/upload/${req.file.filename}`
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success: false,
                message: "Image upload failed"
            });

        }

    }
);


module.exports = MulterRouter;