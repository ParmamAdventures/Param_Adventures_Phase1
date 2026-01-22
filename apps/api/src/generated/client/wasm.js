
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  name: 'name',
  nickname: 'nickname',
  bio: 'bio',
  age: 'age',
  gender: 'gender',
  phoneNumber: 'phoneNumber',
  address: 'address',
  status: 'status',
  statusReason: 'statusReason',
  preferences: 'preferences',
  googleId: 'googleId',
  avatarUrl: 'avatarUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  avatarImageId: 'avatarImageId',
  deletedAt: 'deletedAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  isSystem: 'isSystem',
  createdAt: 'createdAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  key: 'key',
  description: 'description',
  category: 'category',
  createdAt: 'createdAt'
};

exports.Prisma.UserRoleScalarFieldEnum = {
  userId: 'userId',
  roleId: 'roleId'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  action: 'action',
  targetType: 'targetType',
  targetId: 'targetId',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.TripScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  itinerary: 'itinerary',
  durationDays: 'durationDays',
  difficulty: 'difficulty',
  location: 'location',
  price: 'price',
  status: 'status',
  category: 'category',
  startPoint: 'startPoint',
  endPoint: 'endPoint',
  altitude: 'altitude',
  distance: 'distance',
  itineraryPdf: 'itineraryPdf',
  highlights: 'highlights',
  inclusions: 'inclusions',
  exclusions: 'exclusions',
  cancellationPolicy: 'cancellationPolicy',
  thingsToPack: 'thingsToPack',
  faqs: 'faqs',
  seasons: 'seasons',
  coverImageId: 'coverImageId',
  heroImageId: 'heroImageId',
  deletedAt: 'deletedAt',
  createdById: 'createdById',
  approvedById: 'approvedById',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  capacity: 'capacity',
  startDate: 'startDate',
  endDate: 'endDate',
  managerId: 'managerId',
  documentation: 'documentation',
  isFeatured: 'isFeatured'
};

exports.Prisma.TripGalleryImageScalarFieldEnum = {
  tripId: 'tripId',
  imageId: 'imageId',
  order: 'order'
};

exports.Prisma.TripsOnGuidesScalarFieldEnum = {
  tripId: 'tripId',
  guideId: 'guideId',
  assignedAt: 'assignedAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BlogScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  excerpt: 'excerpt',
  content: 'content',
  theme: 'theme',
  status: 'status',
  authorId: 'authorId',
  coverImageId: 'coverImageId',
  tripId: 'tripId',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ImageScalarFieldEnum = {
  id: 'id',
  originalUrl: 'originalUrl',
  mediumUrl: 'mediumUrl',
  thumbUrl: 'thumbUrl',
  width: 'width',
  height: 'height',
  size: 'size',
  mimeType: 'mimeType',
  type: 'type',
  duration: 'duration',
  uploadedById: 'uploadedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tripId: 'tripId',
  status: 'status',
  notes: 'notes',
  startDate: 'startDate',
  guests: 'guests',
  guestDetails: 'guestDetails',
  totalPrice: 'totalPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  paymentStatus: 'paymentStatus'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  provider: 'provider',
  providerOrderId: 'providerOrderId',
  providerPaymentId: 'providerPaymentId',
  razorpayRefundId: 'razorpayRefundId',
  rawPayload: 'rawPayload',
  proofUrl: 'proofUrl',
  amount: 'amount',
  currency: 'currency',
  method: 'method',
  refundedAmount: 'refundedAmount',
  disputeId: 'disputeId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HeroSlideScalarFieldEnum = {
  id: 'id',
  title: 'title',
  subtitle: 'subtitle',
  videoUrl: 'videoUrl',
  ctaLink: 'ctaLink',
  order: 'order',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  rating: 'rating',
  comment: 'comment',
  userId: 'userId',
  tripId: 'tripId',
  createdAt: 'createdAt'
};

exports.Prisma.SavedTripScalarFieldEnum = {
  userId: 'userId',
  tripId: 'tripId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SiteConfigScalarFieldEnum = {
  key: 'key',
  value: 'value',
  label: 'label'
};

exports.Prisma.TripInquiryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phoneNumber: 'phoneNumber',
  destination: 'destination',
  dates: 'dates',
  budget: 'budget',
  details: 'details',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.NewsletterSubscriberScalarFieldEnum = {
  id: 'id',
  email: 'email',
  isSubscribed: 'isSubscribed',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Gender = exports.$Enums.Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED'
};

exports.AuditAction = exports.$Enums.AuditAction = {
  TRIP_CREATED: 'TRIP_CREATED',
  TRIP_UPDATED: 'TRIP_UPDATED',
  TRIP_DELETED: 'TRIP_DELETED',
  TRIP_SUBMITTED: 'TRIP_SUBMITTED',
  TRIP_APPROVED: 'TRIP_APPROVED',
  TRIP_PUBLISHED: 'TRIP_PUBLISHED',
  TRIP_ARCHIVED: 'TRIP_ARCHIVED',
  TRIP_RESTORED: 'TRIP_RESTORED',
  TRIP_COMPLETED: 'TRIP_COMPLETED',
  BLOG_CREATED: 'BLOG_CREATED',
  BLOG_UPDATED: 'BLOG_UPDATED',
  BLOG_SUBMITTED: 'BLOG_SUBMITTED',
  BLOG_APPROVED: 'BLOG_APPROVED',
  BLOG_REJECTED: 'BLOG_REJECTED',
  BLOG_PUBLISHED: 'BLOG_PUBLISHED',
  BLOG_DELETED: 'BLOG_DELETED',
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_REJECTED: 'BOOKING_REJECTED',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  USER_REGISTER: 'USER_REGISTER',
  USER_LOGIN: 'USER_LOGIN',
  USER_CHANGE_PASSWORD: 'USER_CHANGE_PASSWORD',
  USER_UPDATE_PROFILE: 'USER_UPDATE_PROFILE',
  USER_LIST_VIEW: 'USER_LIST_VIEW',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_ROLE_ASSIGNED: 'USER_ROLE_ASSIGNED',
  USER_ROLE_REVOKED: 'USER_ROLE_REVOKED',
  USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
  USER_STATUS_UPDATED: 'USER_STATUS_UPDATED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_UNSUSPENDED: 'USER_UNSUSPENDED',
  USER_BANNED: 'USER_BANNED',
  USER_DELETED: 'USER_DELETED',
  ROLE_CREATED: 'ROLE_CREATED',
  ROLE_UPDATED: 'ROLE_UPDATED',
  ROLE_DELETED: 'ROLE_DELETED',
  ROLE_PERMISSION_ADDED: 'ROLE_PERMISSION_ADDED',
  ROLE_PERMISSION_REMOVED: 'ROLE_PERMISSION_REMOVED',
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  PAYMENT_CAPTURED: 'PAYMENT_CAPTURED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  PAYMENT_DISPUTED: 'PAYMENT_DISPUTED'
};

exports.Difficulty = exports.$Enums.Difficulty = {
  EASY: 'EASY',
  MODERATE: 'MODERATE',
  HARD: 'HARD',
  EXTREME: 'EXTREME'
};

exports.TripStatus = exports.$Enums.TripStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

exports.TripCategory = exports.$Enums.TripCategory = {
  TREK: 'TREK',
  CAMPING: 'CAMPING',
  CORPORATE: 'CORPORATE',
  EDUCATIONAL: 'EDUCATIONAL',
  SPIRITUAL: 'SPIRITUAL',
  CUSTOM: 'CUSTOM'
};

exports.BlogStatus = exports.$Enums.BlogStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED'
};

exports.MediaType = exports.$Enums.MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO'
};

exports.BookingStatus = exports.$Enums.BookingStatus = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

exports.BookingPaymentStatus = exports.$Enums.BookingPaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED'
};

exports.PaymentProvider = exports.$Enums.PaymentProvider = {
  RAZORPAY: 'RAZORPAY',
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL',
  MANUAL: 'MANUAL',
  UNKNOWN: 'UNKNOWN'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  CARD: 'CARD',
  UPI: 'UPI',
  NETBANKING: 'NETBANKING',
  WALLET: 'WALLET',
  OTHER: 'OTHER'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  CREATED: 'CREATED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  DISPUTED: 'DISPUTED'
};

exports.TripInquiryStatus = exports.$Enums.TripInquiryStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  CONVERTED: 'CONVERTED',
  CLOSED: 'CLOSED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Role: 'Role',
  Permission: 'Permission',
  UserRole: 'UserRole',
  RolePermission: 'RolePermission',
  AuditLog: 'AuditLog',
  Trip: 'Trip',
  TripGalleryImage: 'TripGalleryImage',
  TripsOnGuides: 'TripsOnGuides',
  Blog: 'Blog',
  Image: 'Image',
  Booking: 'Booking',
  Payment: 'Payment',
  HeroSlide: 'HeroSlide',
  Review: 'Review',
  SavedTrip: 'SavedTrip',
  SiteConfig: 'SiteConfig',
  TripInquiry: 'TripInquiry',
  NewsletterSubscriber: 'NewsletterSubscriber'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
