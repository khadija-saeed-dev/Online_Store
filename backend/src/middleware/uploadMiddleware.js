import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

export const maxProductImageSize = 5 * 1024 * 1024;
const maxFileSize = maxProductImageSize;
export const maxProductImages = 8;

const allowedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function validateImageFile(file) {
  const extension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
  if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension)) return null;

  const error = new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.');
  error.statusCode = 415;
  return error;
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_request, file) => ({
    folder: 'online_store/products',
    public_id: randomUUID(),
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type: 'image',
  }),
});

const fileFilter = (_request, file, callback) => {
  const error = validateImageFile(file);
  if (error) {
    callback(error);
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: maxProductImages,
  },
  fileFilter,
});

export const uploadProductImages = (request, response, next) => {
  upload.array('images', maxProductImages)(request, response, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError || error.statusCode) {
      next(error);
      return;
    }

    const uploadError = new Error('Image upload failed. Please try again.');
    uploadError.statusCode = 502;
    next(uploadError);
  });
};