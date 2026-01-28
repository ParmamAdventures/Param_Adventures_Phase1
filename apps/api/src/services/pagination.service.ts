/**
 * Pagination Service
 * Advanced pagination with cursor-based approach for optimal performance
 *
 * Strategies:
 * - Cursor-based pagination: Efficient for large datasets, works with deletions
 * - Offset-based pagination: Simple, but slower for large offsets
 * - Keyset pagination: Optimized for ordered data
 * - Sequential pagination: For time-series data
 */
export class PaginationService {
  /**
   * Calculate pagination parameters
   * @param page - Page number (1-indexed)
   * @param pageSize - Items per page
   * @returns Object with skip and take for Prisma
   */
  static calculateOffsetPagination(page: number = 1, pageSize: number = 10) {
    const pageNum = Math.max(1, page);
    const size = Math.max(1, Math.min(pageSize, 100)); // Cap at 100

    return {
      skip: (pageNum - 1) * size,
      take: size,
      page: pageNum,
      pageSize: size,
    };
  }

  /**
   * Calculate cursor-based pagination
   * More efficient for large datasets
   * @param cursor - Current cursor (typically an ID)
   * @param direction - 'next' or 'prev'
   * @param limit - Number of items to fetch
   * @returns Object with cursor, direction, and take
   */
  static calculateCursorPagination(
    cursor: string | null = null,
    direction: "next" | "prev" = "next",
    limit: number = 10,
  ) {
    const size = Math.max(1, Math.min(limit, 100)); // Cap at 100

    // For cursor pagination, we fetch one extra to detect if there are more items
    return {
      cursor: cursor || undefined,
      direction,
      take: direction === "next" ? size + 1 : -(size + 1),
      pageSize: size,
    };
  }

  /**
   * Calculate keyset pagination for ordered data
   * Used for: Timestamp-based pagination (created_at, updated_at)
   */
  static calculateKeysetPagination(
    lastKey: string | null = null,
    limit: number = 10,
    ordering: "asc" | "desc" = "desc",
  ) {
    const size = Math.max(1, Math.min(limit, 100));

    return {
      lastKey: lastKey || undefined,
      limit: size,
      ordering,
      // For keyset, we fetch one extra to detect if there are more
      fetchSize: size + 1,
    };
  }

  /**
   * Process cursor pagination response
   * @param items - Items from database (one extra item to detect more)
   * @param pageSize - Original page size
   * @param direction - Original direction
   * @returns Processed items, next cursor, has more flag
   */
  static processCursorResponse<T extends { id: string }>(
    items: T[],
    pageSize: number,
    direction: "next" | "prev" = "next",
  ) {
    const hasMore = items.length > pageSize;
    const processedItems = items.slice(0, pageSize);

    if (direction === "prev") {
      processedItems.reverse();
    }

    // Get the last item's cursor (typically ID)
    const nextCursor =
      processedItems.length > 0 ? processedItems[processedItems.length - 1].id : null;

    return {
      items: processedItems,
      nextCursor,
      hasMore,
      count: processedItems.length,
    };
  }

  /**
   * Process keyset pagination response
   */
  static processKeysetResponse<T extends { [key: string]: unknown }>(
    items: T[],
    pageSize: number,
    keyField: string = "createdAt",
  ) {
    const hasMore = items.length > pageSize;
    const processedItems = items.slice(0, pageSize);

    const lastKey =
      processedItems.length > 0 ? processedItems[processedItems.length - 1][keyField] : null;

    return {
      items: processedItems,
      lastKey,
      hasMore,
      count: processedItems.length,
    };
  }

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(
    page?: number,
    pageSize?: number,
  ): { valid: boolean; error?: string } {
    if (page !== undefined && (!Number.isInteger(page) || page < 1)) {
      return { valid: false, error: "Page must be a positive integer" };
    }

    if (pageSize !== undefined && (!Number.isInteger(pageSize) || pageSize < 1)) {
      return { valid: false, error: "Page size must be a positive integer" };
    }

    if (pageSize && pageSize > 100) {
      return { valid: false, error: "Page size cannot exceed 100" };
    }

    return { valid: true };
  }

  /**
   * Build Prisma pagination args for offset-based pagination
   */
  static buildOffsetArgs(page: number = 1, pageSize: number = 10) {
    const validation = this.validatePaginationParams(page, pageSize);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { skip, take } = this.calculateOffsetPagination(page, pageSize);

    return {
      skip,
      take,
    };
  }

  /**
   * Build Prisma pagination args for cursor-based pagination
   */
  static buildCursorArgs(
    cursor: string | null,
    direction: "next" | "prev" = "next",
    limit: number = 10,
  ) {
    // Simplified cursor args building
    const { take, cursor: cursorVal } = this.calculateCursorPagination(cursor, direction, limit);

    const args: { take: number; cursor?: { id: string }; skip?: number } = { take };

    if (cursorVal) {
      args.cursor = { id: cursorVal };
      args.skip = 1; // Skip the cursor itself
    }

    return args;
  }

  /**
   * Generate pagination metadata
   */
  static generateMetadata<T>(
    items: T[],
    totalCount: number,
    page?: number,
    pageSize?: number,
    nextCursor?: string | null,
    hasMore?: boolean,
  ) {
    const metadata: {
      count: number;
      total: number;
      page?: number;
      pageSize?: number;
      totalPages?: number;
      hasMore?: boolean;
      nextCursor?: string | null;
    } = {
      count: items.length,
      total: totalCount,
    };

    if (page && pageSize) {
      const totalPages = Math.ceil(totalCount / pageSize);
      metadata.page = page;
      metadata.pageSize = pageSize;
      metadata.totalPages = totalPages;
      metadata.hasMore = page < totalPages;
    } else if (nextCursor !== undefined) {
      metadata.nextCursor = nextCursor;
      metadata.hasMore = hasMore ?? false;
    }

    return metadata;
  }

  /**
   * Optimize query based on pagination type
   * Returns recommended pagination strategy based on dataset size
   */
  static recommendPaginationStrategy(
    totalCount: number,
    _pageSize: number,
  ): "offset" | "cursor" | "keyset" {
    // For small datasets (< 10k items), offset is fine
    if (totalCount < 10000) {
      return "offset";
    }

    // For medium datasets (10k-100k), cursor is better
    if (totalCount < 100000) {
      return "cursor";
    }

    // For large datasets (100k+), keyset is optimal
    return "keyset";
  }

  /**
   * Create paginated response object
   */
  static createPaginatedResponse<T>(items: T[], pagination: object, metadata: object) {
    return {
      data: items,
      pagination: {
        ...pagination,
        ...metadata,
      },
    };
  }
}

/**
 * Pagination Helper for common queries
 */
export class PaginationHelper {
  /**
   * Get paginated trips with optimal strategy
   */
  static getPaginationArgsForTrips(page?: number, pageSize: number = 20, cursor?: string | null) {
    if (cursor) {
      // Use cursor pagination for browsing
      return PaginationService.buildCursorArgs(cursor, "next", pageSize);
    }

    // Use offset for direct page access
    return PaginationService.buildOffsetArgs(page || 1, pageSize);
  }

  /**
   * Get paginated bookings
   */
  static getPaginationArgsForBookings(
    page?: number,
    pageSize: number = 10,
    cursor?: string | null,
  ) {
    if (cursor) {
      return PaginationService.buildCursorArgs(cursor, "next", pageSize);
    }

    return PaginationService.buildOffsetArgs(page || 1, pageSize);
  }

  /**
   * Get paginated users
   */
  static getPaginationArgsForUsers(page?: number, pageSize: number = 15, cursor?: string | null) {
    if (cursor) {
      return PaginationService.buildCursorArgs(cursor, "next", pageSize);
    }

    return PaginationService.buildOffsetArgs(page || 1, pageSize);
  }

  /**
   * Get paginated blogs
   */
  static getPaginationArgsForBlogs(page?: number, pageSize: number = 12, cursor?: string | null) {
    if (cursor) {
      return PaginationService.buildCursorArgs(cursor, "next", pageSize);
    }

    return PaginationService.buildOffsetArgs(page || 1, pageSize);
  }

  /**
   * Format paginated response for API
   */
  static formatPaginatedResponse<T>(
    items: T[],
    totalCount: number,
    page?: number,
    pageSize?: number,
    nextCursor?: string | null,
  ) {
    const metadata = PaginationService.generateMetadata(
      items,
      totalCount,
      page,
      pageSize,
      nextCursor,
    );

    return {
      success: true,
      data: items,
      pagination: metadata,
    };
  }
}
