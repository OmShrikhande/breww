const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const err = (res, message, status = 400) => res.status(status).json({ success: false, message });

module.exports = { ok, err };
