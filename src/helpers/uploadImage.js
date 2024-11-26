const cloudinary = require("../helpers/cloudinary");

const uploadImage = async (file, deleteExisting = false) => {
  try {
    const publicId = 'public_id';
    if (deleteExisting) {
      if (publicId) {
        await cloudinary.v2.uploader.destroy(publicId);
      }
    }
    const myCloud = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'mathwiz/uploadImages',
      resource_type: 'auto',
    });
    return myCloud.secure_url;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

const uploadImages = async (files) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const myCloud = await cloudinary.v2.uploader.upload(file.path, {
        folder: 'mathwiz/uploadImages',
        resource_type: 'auto',
      });
      return myCloud.secure_url;
    });
    return Promise.all(uploadPromises);
  } catch (error) {
    throw new Error('Failed to upload images.');
  }
};
module.exports = { uploadImage, uploadImages };

