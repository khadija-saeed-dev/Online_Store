import { randomUUID } from 'node:crypto';
import { cloudinaryConfigurationMessage, isCloudinaryConfigured } from '../config/cloudinary.js';
import cloudinary from '../config/cloudinary.js';
import { maxProductImageSize, maxProductImages, validateImageFile } from '../middleware/uploadMiddleware.js';

const productImageFolder = 'online_store/products';
const allowedFormats = 'jpg,jpeg,png,webp';
const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
const publicIdPattern = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

function isProductUploadId(value) {
  if (typeof value !== 'string') return false;
  const id = value.startsWith(`${productImageFolder}/`) ? value.slice(productImageFolder.length + 1) : value;
  return publicIdPattern.test(id);
}

function getRequestedFiles(body, response) {
  const files = body?.files;
  if (!Array.isArray(files) || files.length === 0) {
    response.status(400).json({ success: false, message: 'Select at least one image to upload.' });
    return null;
  }
  if (files.length > maxProductImages) {
    response.status(400).json({ success: false, message: `Upload no more than ${maxProductImages} images at a time.` });
    return null;
  }

  for (const file of files) {
    if (!file || typeof file.name !== 'string' || typeof file.type !== 'string' || !Number.isFinite(file.size) || file.size < 0) {
      response.status(400).json({ success: false, message: 'Invalid image metadata.' });
      return null;
    }
    const validationError = validateImageFile({ originalname: file.name, mimetype: file.type });
    if (validationError) {
      response.status(validationError.statusCode).json({ success: false, message: validationError.message });
      return null;
    }
    if (file.size > maxProductImageSize) {
      response.status(413).json({ success: false, message: 'Each image must be 5 MB or smaller.' });
      return null;
    }
  }

  return files;
}

export function requireCloudinaryConfiguration(_request, response, next) {
  if (!isCloudinaryConfigured) {
    response.status(503).json({ success: false, message: cloudinaryConfigurationMessage });
    return;
  }

  next();
}

export function uploadProductImages(request, response) {
  if (!Array.isArray(request.files) || request.files.length === 0) {
    response.status(400).json({ success: false, message: 'Select at least one image to upload.' });
    return;
  }

  if (request.files.length > maxProductImages) {
    response.status(400).json({ success: false, message: `Upload no more than ${maxProductImages} images at a time.` });
    return;
  }

  const images = request.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  if (images.some((image) => !image.url || !image.publicId)) {
    response.status(502).json({ success: false, message: 'Image upload failed. Please try again.' });
    return;
  }

  response.status(201).json({ success: true, images });
}

export function signProductImageUploads(request, response) {
  const files = getRequestedFiles(request.body, response);
  if (!files) return;

  const uploads = files.map(() => {
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = randomUUID();
    const params = {
      allowed_formats: allowedFormats,
      folder: productImageFolder,
      public_id: publicId,
      timestamp,
    };

    return {
      ...params,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      signature: cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET),
    };
  });

  response.json({ success: true, uploads });
}

export async function completeProductImageUploads(request, response) {
  const { publicIds } = request.body || {};
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    response.status(400).json({ success: false, message: 'No uploaded images were provided.' });
    return;
  }
  if (publicIds.length > maxProductImages) {
    response.status(400).json({ success: false, message: `Upload no more than ${maxProductImages} images at a time.` });
    return;
  }
  if (publicIds.some((publicId) => !isProductUploadId(publicId)) || new Set(publicIds).size !== publicIds.length) {
    response.status(400).json({ success: false, message: 'Invalid uploaded image reference.' });
    return;
  }

  const results = await Promise.all(publicIds.map(async (publicId) => {
    try {
      const resource = await cloudinary.api.resource(publicId, { resource_type: 'image' });
      const inProductFolder = resource.asset_folder === productImageFolder
        || resource.public_id.startsWith(`${productImageFolder}/`);
      let secureCloudinaryUrl = false;
      try {
        const imageUrl = new URL(resource.secure_url);
        secureCloudinaryUrl = imageUrl.protocol === 'https:' && imageUrl.hostname === 'res.cloudinary.com';
      } catch {}
      const validResource = resource.resource_type === 'image'
        && inProductFolder
        && allowedExtensions.has(resource.format)
        && resource.bytes <= maxProductImageSize
        && secureCloudinaryUrl;
      return { publicId, resource, valid: validResource };
    } catch {
      return { publicId, resource: null, valid: false };
    }
  }));

  const valid = results.every((result) => result.valid);
  if (!valid) {
    await Promise.all(results
      .filter((result) => result.resource?.public_id)
      .map((result) => cloudinary.uploader.destroy(result.resource.public_id, { resource_type: 'image' }).catch(() => null)));
    response.status(400).json({ success: false, message: 'One or more uploaded images failed server validation.' });
    return;
  }

  response.status(201).json({
    success: true,
    images: results.map(({ resource }) => ({ url: resource.secure_url, publicId: resource.public_id })),
  });
}

export async function cleanupProductImageUploads(request, response) {
  const { publicIds } = request.body || {};
  if (!Array.isArray(publicIds) || publicIds.length > maxProductImages || publicIds.some((publicId) => !isProductUploadId(publicId))) {
    response.status(400).json({ success: false, message: 'Invalid uploaded image references.' });
    return;
  }

  await Promise.all(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => null)));
  response.json({ success: true });
}