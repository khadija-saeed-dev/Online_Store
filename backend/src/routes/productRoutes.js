import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import {
  cleanupProductImageUploads,
  completeProductImageUploads,
  requireCloudinaryConfiguration,
  signProductImageUploads,
  uploadProductImages as sendUploadedProductImages,
} from '../controllers/uploadController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import { uploadProductImages } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/upload/sign', protect, adminOnly, requireCloudinaryConfiguration, signProductImageUploads);
router.post('/upload/complete', protect, adminOnly, requireCloudinaryConfiguration, completeProductImageUploads);
router.post('/upload/cleanup', protect, adminOnly, requireCloudinaryConfiguration, cleanupProductImageUploads);
router.post('/upload', protect, adminOnly, requireCloudinaryConfiguration, uploadProductImages, sendUploadedProductImages);
router.route('/').get(getProducts).post(protect, adminOnly, createProduct);
router.route('/:id').get(getProductById).put(protect, adminOnly, updateProduct).delete(protect, adminOnly, deleteProduct);

export default router;