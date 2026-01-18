/**
 * Reusable Prisma include patterns
 * Prevents duplication of complex include objects across services
 * Ensures consistent data shapes in API responses
 */

export const TripIncludes = {
  /**
   * Basic media relations only
   */
  withMedia: {
    coverImage: true,
    heroImage: true,
    gallery: {
      include: {
        image: true,
      },
      orderBy: {
        order: "asc" as const,
      },
    },
  },

  /**
   * Full trip details with all relations
   */
  withFullDetails: {
    coverImage: true,
    heroImage: true,
    gallery: {
      include: {
        image: true,
      },
      orderBy: {
        order: "asc" as const,
      },
    },
    createdBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    approvedBy: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    manager: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    guides: {
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    },
  },

  /**
   * Public trip listing (minimal data for cards)
   */
  forPublicListing: {
    coverImage: true,
    _count: {
      select: {
        bookings: true,
        reviews: true,
      },
    },
  },

  /**
   * Trip with guides only
   */
  withGuides: {
    guides: {
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    },
  },
};

export const BlogIncludes = {
  /**
   * Basic blog with author
   */
  withAuthor: {
    author: {
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
    coverImage: true,
  },

  /**
   * Full blog details
   */
  withFullDetails: {
    author: {
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
    coverImage: true,
    trip: {
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
      },
    },
  },

  /**
   * Public blog listing
   */
  forPublicListing: {
    author: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
    coverImage: true,
  },
};

export const BookingIncludes = {
  /**
   * Booking with trip details
   */
  withTrip: {
    trip: {
      select: {
        id: true,
        title: true,
        slug: true,
        durationDays: true,
        location: true,
        price: true,
        coverImage: true,
      },
    },
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
      },
    },
  },

  /**
   * Full booking details with payments
   */
  withFullDetails: {
    trip: {
      include: {
        coverImage: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    },
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
      },
    },
    payments: {
      orderBy: {
        createdAt: "desc" as const,
      },
    },
  },

  /**
   * Booking for invoice
   */
  forInvoice: {
    trip: {
      select: {
        title: true,
        slug: true,
        durationDays: true,
        location: true,
      },
    },
    user: {
      select: {
        name: true,
        email: true,
        phoneNumber: true,
      },
    },
    payments: true,
  },
};

export const UserIncludes = {
  /**
   * User with roles and permissions
   */
  withRoles: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    },
  },

  /**
   * Full user profile
   */
  withFullProfile: {
    roles: {
      include: {
        role: true,
      },
    },
    avatarImage: true,
    _count: {
      select: {
        bookings: true,
        blogs: true,
        reviews: true,
        createdTrips: true,
      },
    },
  },

  /**
   * User for public display
   */
  forPublicDisplay: {
    avatarImage: true,
  },
};

export const PaymentIncludes = {
  /**
   * Payment with booking details
   */
  withBooking: {
    booking: {
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    },
  },
};

export const ReviewIncludes = {
  /**
   * Review with user info
   */
  withUser: {
    user: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
  },

  /**
   * Review with trip info
   */
  withTrip: {
    trip: {
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
      },
    },
    user: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
  },
};
