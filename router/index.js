const express = require("express");

const router = express.Router();

const Authrouter = require("./Authrouter");

const multerrouter = require("./multerrouter")

router.use("/", Authrouter);

router.use("/", multerrouter )

module.exports = router;