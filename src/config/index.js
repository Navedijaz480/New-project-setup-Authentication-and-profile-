require("dotenv").config();

module.exports = {
  port: process.env.PORT || 8080,
  dbUrl: process.env.DATABASE_URL,
  liveDb: process.env.LIVE_DB,
  jwtPrivateKey: process.env.JWT_SECRET,
  cloudinary_cloud_name: process.env.CLOUDINARY_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  gmail_app_password: process.env.GMAIL_APP_PASSWORD,
  gmail_app_user: process.env.GMAIL_APP_USER,

};

