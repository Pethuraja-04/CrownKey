const service = require('../services/property.service');
const asyncHandler = require('../utils/asyncHandler');
const { filesToUrls } = require('../middlewares/upload');

const list = asyncHandler(async (req, res) => {
  const data = await service.list(req.query);
  res.json({ success: true, ...data });
});

const detail = asyncHandler(async (req, res) => {
  const data = await service.getBySlugOrId(req.params.idOrSlug, { incrementView: true });
  res.json({ success: true, data });
});

// Normalize a property write request. Accepts:
//   - application/json   → req.body is already the full payload
//   - multipart/form-data → req.body.payload is a JSON string; uploaded files
//                            arrive on req.files; keepImageUrls (in payload)
//                            preserves previously-saved images on edit.
// Returns the body that the service layer will see.
const normalizeBody = (req) => {
  if (!(req.is('multipart/form-data') && req.body && req.body.payload)) {
    return req.body;
  }

  let parsed;
  try {
    parsed = JSON.parse(req.body.payload);
  } catch {
    return req.body; // let downstream validation reject it
  }

  const uploaded = filesToUrls(req.files || []).map((i) => i.url);
  const kept = Array.isArray(parsed.keepImageUrls) ? parsed.keepImageUrls : [];

  // The service treats `imageUrls` as the authoritative new image set when
  // present. Order matters — kept (existing-first) then newly uploaded.
  const merged = [...kept, ...uploaded];
  delete parsed.keepImageUrls;

  return { ...parsed, imageUrls: merged.length ? merged : undefined };
};

const create = asyncHandler(async (req, res) => {
  const body = normalizeBody(req);
  const data = await service.create(req.user.id, body);
  res.status(201).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const body = normalizeBody(req);
  const data = await service.update(req.user.id, req.params.id, body);
  res.json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user.id, req.params.id);
  res.json({ success: true, data: { ok: true } });
});

const addImages = asyncHandler(async (req, res) => {
  const imgs = filesToUrls(req.files);
  const data = await service.addImages(req.user.id, req.params.id, imgs);
  res.status(201).json({ success: true, data });
});

const similar = asyncHandler(async (req, res) => {
  const data = await service.similar(req.params.idOrSlug);
  res.json({ success: true, data });
});

const listMine = asyncHandler(async (req, res) => {
  const data = await service.listOwned(req.user.id, req.query);
  res.json({ success: true, ...data });
});

module.exports = { list, detail, create, update, remove, addImages, similar, listMine };
