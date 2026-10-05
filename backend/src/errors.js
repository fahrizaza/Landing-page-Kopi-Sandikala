// Satu bentuk error untuk seluruh API.
// Clients membaca `code` (mesin) dan `message` (manusia).
class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function notFound(resource, id) {
  return new ApiError(404, "NOT_FOUND", `${resource} dengan id ${id} tidak ditemukan`);
}

function badRequest(message) {
  return new ApiError(400, "VALIDATION_ERROR", message);
}

// Express 5 meneruskan rejection dari handler async ke middleware ini.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Duplikasi entry unik (mis. slug yang sama) dari database.
  if (err && err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      code: "DUPLICATE",
      message: "Data dengan nilai unik yang sama sudah ada",
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ code: err.code, message: err.message });
  }

  // Detail internal (SQL, stack) hanya masuk log, tidak pernah ke response.
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  return res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "Terjadi kesalahan pada server",
  });
}

module.exports = { ApiError, notFound, badRequest, errorHandler };
