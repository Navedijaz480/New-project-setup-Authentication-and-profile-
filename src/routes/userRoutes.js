const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { userAuth } = require("../middleware/authMiddleware");
const validateObjectId = require('../middleware/validateObjectId');
const upload = require('../middleware/multer')
const { bodyChecker } = require("../middleware/bodyChecker");

// sign up api
router.post("/sign_up", bodyChecker, userController.userSignUp);
//login API
router.post("/login", bodyChecker, userController.userLogin);
//send otp to forgot password
router.post("/otp/email", bodyChecker, userController.sendOTP);
//verify otp to reset password
router.post("/reset-password/otp/verify", bodyChecker, userController.verifyOTP);
// reset password after verify otp
router.post("/reset_password", bodyChecker, userController.resetPassword);
//change password 
router.post("/update_password", userAuth, bodyChecker, userController.updatePassword);
//logout user
router.post("/logout/:id", validateObjectId, userController.userLogout);
//get all user 
router.get("/get_users", userAuth, userController.getAllUsers);

//  update profile 
router.post('/update_profile', userAuth, upload.single('uploadImage'), (req, res) => {
    userController.updateProfile(req, res);
});

router.route("/:id")
    .get(userAuth, validateObjectId, userController.getUserById)

module.exports = router;

