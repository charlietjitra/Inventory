/**
 * Parse pagination parameters from request query
 * @param req Express request object
 * @param defaultLimit Default items per page (default: 50)
 * @returns {page, limit, offset}
 */
function getPaginationParams(req, defaultLimit = 50) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(
    Math.max(1, parseInt(req.query.limit) || defaultLimit),
    200,
  ); // Cap at 200
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Format paginated response
 * @param data Array of items
 * @param total Total count of items
 * @param page Current page
 * @param limit Items per page
 * @returns Formatted pagination response
 */
function formatPaginatedResponse(data, total, page, limit) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

module.exports = {
  getPaginationParams,
  formatPaginatedResponse,
};
