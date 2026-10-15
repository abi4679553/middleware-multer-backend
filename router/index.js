const express = require("express");

const router = express.Router();

const Authrouter = require("./Authrouter");

// const multerrouter = require("./multerrouter")

const ImageRouter = require('./ImageRouter')


router.use(Authrouter);

// router.use(multerrouter)

router.use(ImageRouter)

module.exports = router;