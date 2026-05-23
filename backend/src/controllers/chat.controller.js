const chatService = require('../services/chat.service');
const asyncHandler = require('../utils/asyncHandler');

const message = asyncHandler(async (req, res) => {
  const data = await chatService.reply(req.body);
  res.json({ success: true, data });
});

module.exports = { message };
