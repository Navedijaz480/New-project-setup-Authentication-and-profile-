const mongoose = require('mongoose');
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            // unique: true,
            validate: [validator.isEmail, "Please enter a valid email"],
        },
        password: {
            type: String,
            minlength: 8,
        },
        grade: {
            type: Number,
            min: 0,
            max: 12
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
        },
        otpStatus: {
            type: Boolean,
            enum: [false, true],
            default: false
        },

        image: {
            type: String
        },
        mobileNumber: {
            type: String,
            validate: {
                validator: function (value) {
                    return /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(value);
                },
                message: 'Please enter a valid mobile number.'
            }
        },
        role: {
            type: String,
            enum: ['teacher', 'student', 'admin'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        }
    },
    {
        timestamps: true,
    }
);
//for password encryption
userSchema.methods.comparePassword = async function (password) {
    try {
        return await bcryptjs.compare(password, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;

