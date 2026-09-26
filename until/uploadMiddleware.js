const multer = require("multer");
const path = require("path");

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

const uploadMiddleware = multer({
    storage: storage
});

module.exports = uploadMiddleware;