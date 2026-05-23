const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts. Try again later.' } },
});

const inquiryLimiter = rateLimit({
  windowMs: env.rateLimits.inquiryWindowMin * 60 * 1000,
  limit: env.rateLimits.inquiryMaxPerWindow,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Track per IP+email so a single IP can't flood different listings either.
  keyGenerator: (req) => `${req.ip}:${(req.body?.email || '').toLowerCase()}`,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many inquiries. Please wait before sending more.' } },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Cap how often a single IP can hit the AI endpoint — Groq's free tier is
// generous but not unlimited, and abuse would burn through it quickly.
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.rateLimits.chatMaxPerHour,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'You\'ve sent a lot of messages — please wait a bit before chatting again.' } },
});

module.exports = { authLimiter, inquiryLimiter, generalLimiter, chatLimiter };
