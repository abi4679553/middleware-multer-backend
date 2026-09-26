const express = require("express");

const {createUser,login} = require("../controller/Auth");

const {middleware,allowRoles} = require("../middleware/Auth");

const router = express.Router();



router.post("/create-user", createUser);

router.post("/login", login);



router.get( "/admin-test", middleware, allowRoles("admin"), (req, res) => {
    res.json({ success: true,  message: "Admin access granted", user: req.user });
  }
);



router.get( "/employee-test",  middleware, allowRoles("employee"),  (req, res) => {
    res.json({  success: true,  message: "Employee access granted",  user: req.user });
  }
);



router.get( "/common-test", middleware, allowRoles("admin", "employee"), (req, res) => {
    res.json({  success: true,  message: "Admin / Employee access granted",   user: req.user  });
  }
);


module.exports = router;