const { z } = require('zod');

const createSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  phone: z.string().min(7).max(20),
  message: z.string().min(10).max(2000),
});

module.exports = { createSchema };
