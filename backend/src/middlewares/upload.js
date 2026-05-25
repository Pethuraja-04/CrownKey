const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const env = require('../config/env');
const AppError = require('../utils/AppError');

let storage;
let isCloudinary = false;

// Configure Cloudinary if credentials exist
if (env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'crownkey/properties',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      // transformations can be added here
    },
  });
  isCloudinary = true;
} else {
  // Fallback to local disk storage
  const baseDir = path.resolve(process.cwd(), env.uploads.dir);
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, baseDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const safe = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      cb(null, safe);
    },
  });
}

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

const upload = multer({
  storage,
  limits: { fileSize: env.uploads.maxMb * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      return cb(AppError.badRequest(`Unsupported image type: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

const filesToUrls = (files = []) =>
  files.map((f, idx) => ({
    // Cloudinary returns .path or .url
    url: isCloudinary ? f.path : `${env.publicBaseUrl}/uploads/${f.filename}`,
    order: idx,
    isPrimary: idx === 0,
  }));

module.exports = { upload, filesToUrls, isCloudinary };
