const router = require("express").Router();

const userRoutes = require("../routes/userRoutes");

router.use("/user", userRoutes);
module.exports = router;

