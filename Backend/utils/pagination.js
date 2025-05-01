/**
 * Creates a pagination object with metadata for API responses
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} totalItems - Total number of items
 * @param {string} baseUrl - Base URL for generating navigation links
 * @returns {Object} Pagination metadata and links
 */
exports.getPaginationMetadata = (page, limit, totalItems, baseUrl) => {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = parseInt(page);
    
    return {
        currentPage,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        nextPage: currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}&limit=${limit}` : null,
        previousPage: currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}&limit=${limit}` : null
    };
};

/**
 * Creates a mongoose query object with pagination
 * @param {Object} query - Mongoose query object
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Modified query with pagination
 */
exports.paginateQuery = (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(parseInt(limit));
};

/**
 * Validates and sanitizes pagination parameters
 * @param {Object} queryParams - Request query parameters
 * @returns {Object} Sanitized pagination parameters
 */
exports.validatePaginationParams = (queryParams) => {
    const page = Math.max(1, parseInt(queryParams.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 10));
    
    return { page, limit };
};

/**
 * Creates a paginated response object
 * @param {Array} data - Array of items for current page
 * @param {Object} metadata - Pagination metadata
 * @returns {Object} Formatted response with data and pagination info
 */
exports.paginatedResponse = (data, metadata) => {
    return {
        success: true,
        data,
        pagination: metadata
    };
}; 