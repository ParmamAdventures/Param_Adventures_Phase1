import { EntityStatus } from "../constants/status";

type WhereCondition<T = Record<string, unknown>> = {
  OR?: Array<T | Record<string, unknown>>;
  status?: unknown; // Allow generic Prisma enum filters
  [key: string]: unknown;
};

/**
 * Helper to apply "Public or Author" permission logic to a Prisma where clause.
 *
 * @param where - The existing where clause object to mutate or spread.
 * @param userId - The ID of the current user (if any).
 * @param canViewInternal - Whether the user has internal view permissions (admin/moderator).
 * @param authorField - The field name for the author ID (default: "authorId").
 * @returns The updated where clause.
 */
export function applyPublicOrAuthorFilter(
  where: WhereCondition,
  userId?: string,
  canViewInternal: boolean = false,
  authorField: string = "authorId",
): WhereCondition {
  if (!canViewInternal) {
    if (userId) {
      where.OR = [{ status: EntityStatus.PUBLISHED }, { [authorField]: userId }];
    } else {
      where.status = EntityStatus.PUBLISHED;
    }
  }
  return where;
}
