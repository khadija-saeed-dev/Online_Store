import { v2 as cloudinary } from 'cloudinary';

const cloudinaryEnvironment = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

export const isCloudinaryConfigured = Object.values(cloudinaryEnvironment).every(Boolean);

export const cloudinaryConfigurationMessage =
  'Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.';

if (isCloudinaryConfigured) {
  cloudinary.config({ ...cloudinaryEnvironment, secure: true });
}

export default cloudinary;