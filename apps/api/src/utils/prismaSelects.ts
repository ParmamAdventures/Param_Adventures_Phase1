/**
 * Common Prisma Include/Select objects to reduce duplication
 */

export const TRIP_LIST_INCLUDE = {
  coverImage: true,
} as const;

export const USER_WITH_ROLES_INCLUDE = {
  roles: {
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  },
} as const;
