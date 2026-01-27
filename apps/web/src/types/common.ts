/**
 * Common types used across the application
 */

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Generic pagination metadata */
export interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
  limit?: number;
}

/** Generic metadata object */
export type Metadata = Record<string, unknown>;

/** Generic event handler for form inputs */
export type FormEventHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
) => void;

/** Generic file input handler */
export type FileEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

/** Generic async function */
export type AsyncFunction<T = unknown> = () => Promise<T>;

/** Generic dictionary/map */
export type Dictionary<T = unknown> = Record<string, T>;

/** Generic entity with timestamps */
export interface Entity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/** Generic list response with pagination */
export interface ListResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** Generic status type */
export type Status = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "BANNED" | "PENDING";

/** Generic error response */
export interface ErrorResponse {
  code: string;
  message: string;
  status?: number;
  details?: Metadata;
}
