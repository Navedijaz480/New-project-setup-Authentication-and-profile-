const User = require("../models/User");
const OTP = require("../models/OTP");
const paginate = require("../helpers/paginationHeloper")
const bcryptjs = require("bcryptjs");
const { uploadImage } = require('../helpers/uploadImage');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require("../middleware/emailSender");
const config = require('../config')
const { successResponse, errorResponse } = require("../helpers/response");

const userSignUp = async (req, res) => {
    try {
        const { password, email, ...otherUserData } = req.body;

        // Step 1: Check if a user with the given email already exists
        const isUserExists = await User.findOne({ email });
        if (isUserExists) {
            return errorResponse(res, 'User already exists', 409);
        }

        // Step 2: Validate the new user data
        const userInstance = new User({ email, ...otherUserData });
        const validationErrors = userInstance.validateSync();
        if (validationErrors) {
            return errorResponse(res, validationErrors.message, 400);
        }

        // Step 3: Hash the user's password for secure storage
        const encryptedPassword = await bcryptjs.hash(password, 10);
        userInstance.password = encryptedPassword;

        // Step 4: Save the new user in the database
        const createdUser = await userInstance.save();
        createdUser.password = undefined; // Remove the password from the response object

        // Step 5: Generate a JWT token for the new user
        const jwtPayload = { id: createdUser._id, email: createdUser.email };

        const authToken = jwt.sign(
            jwtPayload,
            config.jwtPrivateKey,
            { expiresIn: '1d' }
        );

        // Step 6: Send a success response with user data and the generated token
        return successResponse(res, 201, "User registered successfully.", {
            user: createdUser,
            token: authToken,
        });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return errorResponse(res, "Email and password fields are required.", 400);
    }

    try {
        // Step 1: Check if the user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return errorResponse(
                res,
                "Incorrect login details. Please check your email and password and try again.",
                404
            );
        }

        // Step 2: Validate the provided password
        const isPasswordCorrect = await existingUser.comparePassword(password);
        if (!isPasswordCorrect) {
            return errorResponse(
                res,
                "Invalid login credentials. Please check your email and password.",
                401
            );
        }

        // Step 3: Generate the JWT token
        const jwtPayload = { id: existingUser._id, email: existingUser.email };
        const authToken = jwt.sign(jwtPayload, config.jwtPrivateKey, { expiresIn: '1d' });

        // Step 4: Fetch the user details excluding sensitive fields
        const userDetails = await User.findById(existingUser._id).select("-__v -password");

        // Step 5: Return success response with user details and token
        return successResponse(res, 200, "User logged in successfully.", {
            user: userDetails,
            token: authToken,
        });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

const userLogout = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }
        return successResponse(res, "Logout successfully", user);
    }
    catch (err) {
        return errorResponse(res, err.message, 500);
    }
};
const getAllUsers = async (req, res) => {
    try {
        const { page, limit } = req.query;
        // Use the paginate helper function
        const result = await paginate(User, {}, page, limit);
        return successResponse(res, 200, "Success", {
            users: result.documents.map((user) => {
                const { password, ...rest } = user.toObject();
                return rest;
            }),
            totalCount: result.totalDocuments,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
        });
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-__v -password")
        if (user) {
            return successResponse(res, user);
        } else {
            return errorResponse(res, 'No Data Found', 404);
        }
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};
const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }
        const isOldPasswordCorrect = await bcryptjs.compare(oldPassword, user.password);
        if (!isOldPasswordCorrect) {
            return errorResponse(res, 'Old password is incorrect', 404);
        }
        if (oldPassword === newPassword) {
            return errorResponse(res, 'New password cannt be the same as the old password', 400);
        }
        if (newPassword.length < 8) {
            return errorResponse(res, ' New password must be at least 8 characters long', 400);
        }
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return successResponse(res, "Password updated Successfully.");
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};

const resetPassword = async (req, res) => {
    try {
        const { newPassword, email } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }
        if (user.otpStatus == false) {
            return errorResponse(res, 'OTP is not verified yet', 404);
        }
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otpStatus = false;

        await user.save();
        return successResponse(res, "Password updated Successfully.");
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};
//Generate OTP Email
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Step 1: Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }
        // Step 2: Generate a new OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        const otpCreatedAt = Date.now();

        // Step 3: Insert or update OTP record with a new OTP
        await OTP.findOneAndUpdate(
            { email },
            {
                email,
                otp,
                createdAt: otpCreatedAt,
                expiresAt: otpCreatedAt + 5 * 60 * 1000
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );
        // Step 4: Send OTP email asynchronously
        const emailResponse = await sendOTPEmail(email, otp);
        // Step 5: Return success response
        return successResponse(res, "OTP successfully sent to your email.");
    }
    catch (err) {
        return errorResponse(res, err.message, 500);
    }
};
//verify otp for account verification
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        // Aggregate the user and OTP in a single query    
        const result = await User.aggregate([
            {
                $match: { email } // Find the user by email
            },
            {
                $lookup: {
                    from: "otps", // Assuming 'otps' is the collection name for OTP records
                    localField: "email",
                    foreignField: "email",
                    as: "otpRecord"
                }
            },
            {
                $unwind: "$otpRecord" // Deconstruct the OTP array to return a single record
            },
            {
                $project: {
                    email: 1,
                    otpRecord: {
                        otp: 1,
                        expiresAt: 1
                    }
                }
            }
        ]);
        // Check if both the user and OTP record exist
        if (!result.length) {
            return errorResponse(res, 'User or OTP record not found.', 404);
        }
        const user = result[0];
        const otpRecord = user.otpRecord;
        // Check if the OTP matches
        if (otpRecord.otp != otp) {
            return errorResponse(res, 'Invalid OTP', 400);
        }

        if (otpRecord.verified) {
            return errorResponse(res, 'User already verify OTP', 500);
        }
        // Check if the OTP has expired
        const dateTimestamp = new Date(otpRecord.expiresAt).getTime();
        if (dateTimestamp < Date.now()) {
            return errorResponse(res, 'OTP has been expired', 400);
        }
        await User.findOneAndUpdate(
            { email },
            {
                email,
                otpStatus: true,
            },
        );
        return successResponse(res, "OTP verified successfully.")

    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};

const updateProfile = async (req, res) => {
    const { image, ...userData } = req.body;
    const decodedToken = req.user;
    const id = decodedToken.id;
    try {
        let updatedFields = {
            ...userData,
        };
        if (req.file) {
            const imageUrl = await uploadImage(req.file);
            updatedFields.image = imageUrl;
        }
        const updatedUser = await User.findOneAndUpdate(
            { _id: id },
            updatedFields,
            {
                new: true,
            }
        ).select('-password');
        if (!updatedUser) {
            return errorResponse(res, 'User not found', 404);
        }
        return successResponse(res, 200, "User profile updated successfully.", {
            user: updatePassword,
        });
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};

module.exports = {
    userSignUp,
    userLogin,
    userLogout,
    getAllUsers,
    getUserById,
    updateProfile,
    updatePassword,
    resetPassword,
    sendOTP,
    verifyOTP
}

