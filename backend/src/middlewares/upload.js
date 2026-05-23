const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const baseDir = path.resolve(process.cwd(), env.uploads.dir);
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, baseDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safe = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, safe);
  },
});

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
    url: `${env.publicBaseUrl}/uploads/${f.filename}`,
    order: idx,
    isPrimary: idx === 0,
  }));

module.exports = { upload, filesToUrls };
