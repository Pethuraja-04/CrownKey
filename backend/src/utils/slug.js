const slugify = require('slugify');
const crypto = require('crypto');

const buildSlug = (title) => {
  const base = slugify(title, { lower: true, strict: true, trim: true }).slice(0, 80);
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
};

module.exports = { buildSlug };
