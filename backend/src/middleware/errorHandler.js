// ============================================================================
// ERROR HANDLING AND VALIDATION MIDDLEWARE
// ============================================================================

// Standard error handler
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: "Validation Error",
      message: err.details.map((d) => d.message).join(", "),
    });
  }

  // Database errors
  if (err.name === "PostgresError" || err.code) {
    // Unique constraint violation
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Conflict",
        message: "Duplicate entry: " + err.detail,
      });
    }
    // Foreign key violation
    if (err.code === "23503") {
      return res.status(400).json({
        error: "Invalid Reference",
        message: "Referenced entity does not exist",
      });
    }
    // Check constraint violation
    if (err.code === "23514") {
      return res.status(400).json({
        error: "Invalid Value",
        message: "Value violates constraint: " + err.detail,
      });
    }
  }

  // Custom business logic errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.error || "Error",
      message: err.message,
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred",
  });
};

// Async handler wrapper to catch Promise rejections
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class BusinessError extends Error {
  constructor(message, statusCode = 400, error = "Error") {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  BusinessError,
};
