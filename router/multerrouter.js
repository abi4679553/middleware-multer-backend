const express = require("express");

const multermodel = require("../models/Multerschema");
const upload = require("../until/uploadMiddleware");
const cloudinary = require("../config/cloudinary");

const MulterRouter = express.Router();

MulterRouter.post(
    "/create-images",
    upload.array("image", 5),

    async (req, res) => {
        try {
            const { name, age } = req.body;

            if (!name || age === undefined || age === "" ||
                !req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Name, age and at least one image are required",
                });
            }

            const uploadedImages = await Promise.all(
                req.files.map((file) =>
                    new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            {
                                folder: "myapp-images",
                                resource_type: "image",
                            },
                            (error, result) => {
                                if (error) {
                                    return reject(error);
                                }

                                resolve({
                                    filename: result.public_id,
                                    filepath: result.secure_url,
                                });
                            }
                        );

                        stream.end(file.buffer);
                    })
                )
            );

            const newData = new multermodel({
                name,
                age: Number(age),
                image: uploadedImages,
            });

            const savedData = await newData.save();

            return res.status(201).json({
                success: true,
                message: "Images uploaded to Cloudinary and saved in MongoDB",
                data: savedData,
            });

        } catch (error) {
            console.error("Image upload error:", error);

            return res.status(500).json({
                success: false,
                message: error.message || "Image upload failed",
            });
        }
    }
);

module.exports = MulterRouter;