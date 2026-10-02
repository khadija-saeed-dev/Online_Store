import mongoose from 'mongoose';
import Product from '../models/Product.js';

const productFields = [
  'name',
  'description',
  'price',
  'category',
  'brand',
  'images',
  'stock',
  'ratings',
  'numReviews',
  'isFeatured',
  'isActive',
];

const sortOptions = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  rating_desc: { ratings: -1 },
};

const createError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

function requireDatabase(response) {
  if (mongoose.connection.readyState === 1) return true;

  response.status(503).json({
    success: false,
    message: 'Database is not connected',
  });
  return false;
}

function sendError(response, error) {
  let statusCode = error.statusCode || 500;

  if (error.name === 'ValidationError' || error.name === 'CastError') statusCode = 400;
  if (error.code === 11000) statusCode = 409;

  response.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
}

function readProductPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError(400, 'Request body must be a JSON object');
  }

  return Object.fromEntries(
    productFields
      .filter((field) => Object.hasOwn(body, field))
      .map((field) => [field, body[field]]),
  );
}

function validateProductPayload(payload, { partial = false } = {}) {
  const requiredStringFields = ['name', 'description', 'category'];

  for (const field of requiredStringFields) {
    const value = payload[field];
    if ((!partial && value === undefined) || (value !== undefined && (typeof value !== 'string' || !value.trim()))) {
      throw createError(400, `${field} is required and must be a non-empty string`);
    }
  }

  if (!partial && payload.price === undefined) {
    throw createError(400, 'price is required and must be a non-negative number');
  }

  const numericFields = ['price', 'stock', 'ratings', 'numReviews'];
  for (const field of numericFields) {
    const value = payload[field];
    if (value === undefined) continue;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw createError(400, `${field} must be a non-negative number`);
    }
    if (field === 'ratings' && value > 5) {
      throw createError(400, 'ratings must be between 0 and 5');
    }
  }

  for (const field of ['brand']) {
    if (payload[field] !== undefined && typeof payload[field] !== 'string') {
      throw createError(400, `${field} must be a string`);
    }
  }

  if (payload.images !== undefined && (!Array.isArray(payload.images) || payload.images.some((image) => typeof image !== 'string'))) {
    throw createError(400, 'images must be an array of strings');
  }
  if (payload.images?.some((image) => {
    try {
      const imageUrl = new URL(image);
      return !['http:', 'https:'].includes(imageUrl.protocol);
    } catch {
      return true;
    }
  })) {
    throw createError(400, 'Each image must be an absolute HTTP or HTTPS URL');
  }

  for (const field of ['isFeatured', 'isActive']) {
    if (payload[field] !== undefined && typeof payload[field] !== 'boolean') {
      throw createError(400, `${field} must be a boolean`);
    }
  }
}

function parseBoolean(value, field) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw createError(400, `${field} must be true or false`);
}

function parsePrice(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createError(400, `${field} must be a non-negative number`);
  }

  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    throw createError(400, `${field} must be a non-negative number`);
  }
  return price;
}

function parsePositiveInteger(value, fallback, field) {
  if (value === undefined) return fallback;

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw createError(400, `${field} must be a positive integer`);
  }
  return parsedValue;
}

function isValidProductId(id) {
  return /^[\da-f]{24}$/i.test(id) && mongoose.isValidObjectId(id);
}

export async function getProducts(request, response) {
  try {
    if (!requireDatabase(response)) return;

    const page = parsePositiveInteger(request.query.page, 1, 'page');
    const requestedLimit = parsePositiveInteger(request.query.limit, 12, 'limit');
    const limit = Math.min(requestedLimit, 100);
    const sort = request.query.sort || 'newest';

    if (!sortOptions[sort]) {
      throw createError(400, `Unsupported sort option: ${sort}`);
    }

    const filter = {};
    const search = request.query.search?.trim();
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    if (request.query.category !== undefined) {
      if (typeof request.query.category !== 'string' || !request.query.category.trim()) {
        throw createError(400, 'category must be a non-empty string');
      }
      const escapedCategory = request.query.category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.category = { $regex: `^${escapedCategory}$`, $options: 'i' };
    }

    const minimumPrice = request.query.minPrice === undefined ? undefined : parsePrice(request.query.minPrice, 'minPrice');
    const maximumPrice = request.query.maxPrice === undefined ? undefined : parsePrice(request.query.maxPrice, 'maxPrice');
    if (minimumPrice !== undefined && maximumPrice !== undefined && minimumPrice > maximumPrice) {
      throw createError(400, 'minPrice cannot be greater than maxPrice');
    }
    if (minimumPrice !== undefined || maximumPrice !== undefined) {
      filter.price = {};
      if (minimumPrice !== undefined) filter.price.$gte = minimumPrice;
      if (maximumPrice !== undefined) filter.price.$lte = maximumPrice;
    }

    if (request.query.featured !== undefined) {
      filter.isFeatured = parseBoolean(request.query.featured, 'featured');
    }

    const activeFilter = request.query.active ?? request.query.isActive;
    filter.isActive = activeFilter === undefined ? true : parseBoolean(activeFilter, 'active');

    const skip = (page - 1) * limit;
    const [products, totalItems] = await Promise.all([
      Product.find(filter).sort(sortOptions[sort]).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    response.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    sendError(response, error);
  }
}

export async function getProductById(request, response) {
  try {
    if (!isValidProductId(request.params.id)) {
      throw createError(400, 'Invalid product id');
    }
    if (!requireDatabase(response)) return;

    const product = await Product.findById(request.params.id);
    if (!product) {
      return response.status(404).json({ success: false, message: 'Product not found' });
    }

    return response.json({ success: true, data: product });
  } catch (error) {
    return sendError(response, error);
  }
}

export async function createProduct(request, response) {
  try {
    const payload = readProductPayload(request.body);
    validateProductPayload(payload);
    if (!requireDatabase(response)) return;

    const product = await Product.create(payload);
    return response.status(201).json({ success: true, data: product });
  } catch (error) {
    return sendError(response, error);
  }
}

export async function updateProduct(request, response) {
  try {
    if (!isValidProductId(request.params.id)) {
      throw createError(400, 'Invalid product id');
    }
    const payload = readProductPayload(request.body);
    if (Object.keys(payload).length === 0) {
      throw createError(400, 'Provide at least one product field to update');
    }
    validateProductPayload(payload, { partial: true });
    if (!requireDatabase(response)) return;

    const product = await Product.findById(request.params.id);
    if (!product) {
      return response.status(404).json({ success: false, message: 'Product not found' });
    }

    Object.assign(product, payload);
    await product.save();
    return response.json({ success: true, data: product });
  } catch (error) {
    return sendError(response, error);
  }
}

export async function deleteProduct(request, response) {
  try {
    if (!isValidProductId(request.params.id)) {
      throw createError(400, 'Invalid product id');
    }
    if (!requireDatabase(response)) return;

    const product = await Product.findByIdAndDelete(request.params.id);
    if (!product) {
      return response.status(404).json({ success: false, message: 'Product not found' });
    }

    return response.json({ success: true, data: product });
  } catch (error) {
    return sendError(response, error);
  }
}