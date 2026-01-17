/**
 * Custom HTTP error class for API error handling.
 * Extends Error with HTTP status code and error code for structured error responses.
 * Automatically caught and handled by error middleware.
 */
export class HttpError extends Error {
  public status: number;
  public code: string;

  /**
   * Create an HttpError instance.
   * @param {number} status - HTTP status code (401, 403, 404, etc)
   * @param {string} code - Error code identifier (AUTH_FAILED, FORBIDDEN, NOT_FOUND, etc)
   * @param {string} message - Human-readable error message
   */
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "HttpError";
  }
}
