const { default: mongoose } = require("mongoose");
const { sendOTPEmail } = require("../middleware/emailSender");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: function () {
      return Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
    },
  },
});

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendOTPEmail(this.email, this.otp);
  }
  next();
});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;

