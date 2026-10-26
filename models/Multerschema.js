const mongoose = require("mongoose");

const multerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        age: {
            type: Number,
            required: true,
        },

        image: [
            {
                filename: {
                    type: String,
                    required: true,
                },

                filepath: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Multer", multerSchema);