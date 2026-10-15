const express = require("express");
const router = express.Router();

const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");
const Image = require("../models/ImageModel");

const { Readable } = require("stream");

router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image"
            });
        }

        console.log("calling")

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "my-images" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            Readable.from(req.file.buffer).pipe(stream);
        });

        const savedImage = await Image.create({
            name: req.body.name,
            imageUrl: result.secure_url,
            publicId: result.public_id
        });


        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            data: savedImage
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;