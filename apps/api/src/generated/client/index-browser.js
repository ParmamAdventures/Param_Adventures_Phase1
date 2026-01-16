
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
} = require('./runtime/index-browser')


const Prisma = {}

exports.Prisma = Prisma

/**
 * Prisma Client JS version: 4.16.2
 * Query Engine version: 4bc8b6e1b66cb932731fb1bdbbc550d1e010de81
 */
Prisma.prismaVersion = {
  client: "4.16.2",
  engine: "4bc8b6e1b66cb932731fb1bdbbc550d1e010de81"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
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
  avatarImageId: 'avatarImageId'
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
  coverImageLegacy: 'coverImageLegacy',
  galleryLegacy: 'galleryLegacy',
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
  assignedAt: 'assignedAt'
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
  createdAt: 'createdAt'
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
  isActive: 'isActive',
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

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  name: 'name',
  nickname: 'nickname',
  bio: 'bio',
  gender: 'gender',
  phoneNumber: 'phoneNumber',
  address: 'address',
  statusReason: 'statusReason',
  googleId: 'googleId',
  avatarUrl: 'avatarUrl',
  avatarImageId: 'avatarImageId'
};

exports.Prisma.RoleOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description'
};

exports.Prisma.PermissionOrderByRelevanceFieldEnum = {
  id: 'id',
  key: 'key',
  description: 'description',
  category: 'category'
};

exports.Prisma.UserRoleOrderByRelevanceFieldEnum = {
  userId: 'userId',
  roleId: 'roleId'
};

exports.Prisma.RolePermissionOrderByRelevanceFieldEnum = {
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.AuditLogOrderByRelevanceFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  action: 'action',
  targetType: 'targetType',
  targetId: 'targetId'
};

exports.Prisma.TripOrderByRelevanceFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  difficulty: 'difficulty',
  location: 'location',
  startPoint: 'startPoint',
  endPoint: 'endPoint',
  altitude: 'altitude',
  distance: 'distance',
  itineraryPdf: 'itineraryPdf',
  coverImageId: 'coverImageId',
  heroImageId: 'heroImageId',
  coverImageLegacy: 'coverImageLegacy',
  galleryLegacy: 'galleryLegacy',
  createdById: 'createdById',
  approvedById: 'approvedById',
  managerId: 'managerId'
};

exports.Prisma.TripGalleryImageOrderByRelevanceFieldEnum = {
  tripId: 'tripId',
  imageId: 'imageId'
};

exports.Prisma.TripsOnGuidesOrderByRelevanceFieldEnum = {
  tripId: 'tripId',
  guideId: 'guideId'
};

exports.Prisma.BlogOrderByRelevanceFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  excerpt: 'excerpt',
  theme: 'theme',
  authorId: 'authorId',
  coverImageId: 'coverImageId',
  tripId: 'tripId'
};

exports.Prisma.ImageOrderByRelevanceFieldEnum = {
  id: 'id',
  originalUrl: 'originalUrl',
  mediumUrl: 'mediumUrl',
  thumbUrl: 'thumbUrl',
  mimeType: 'mimeType',
  uploadedById: 'uploadedById'
};

exports.Prisma.BookingOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  tripId: 'tripId',
  notes: 'notes'
};

exports.Prisma.PaymentOrderByRelevanceFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  provider: 'provider',
  providerOrderId: 'providerOrderId',
  providerPaymentId: 'providerPaymentId',
  razorpayRefundId: 'razorpayRefundId',
  proofUrl: 'proofUrl',
  currency: 'currency',
  method: 'method',
  disputeId: 'disputeId'
};

exports.Prisma.HeroSlideOrderByRelevanceFieldEnum = {
  id: 'id',
  title: 'title',
  subtitle: 'subtitle',
  videoUrl: 'videoUrl',
  ctaLink: 'ctaLink'
};

exports.Prisma.ReviewOrderByRelevanceFieldEnum = {
  id: 'id',
  comment: 'comment',
  userId: 'userId',
  tripId: 'tripId'
};

exports.Prisma.SavedTripOrderByRelevanceFieldEnum = {
  userId: 'userId',
  tripId: 'tripId'
};

exports.Prisma.SiteConfigOrderByRelevanceFieldEnum = {
  key: 'key',
  value: 'value',
  label: 'label'
};

exports.Prisma.TripInquiryOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phoneNumber: 'phoneNumber',
  destination: 'destination',
  dates: 'dates',
  budget: 'budget',
  details: 'details',
  status: 'status'
};

exports.Prisma.NewsletterSubscriberOrderByRelevanceFieldEnum = {
  id: 'id',
  email: 'email'
};
exports.UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED'
};

exports.TripStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

exports.TripCategory = {
  TREK: 'TREK',
  CAMPING: 'CAMPING',
  CORPORATE: 'CORPORATE',
  EDUCATIONAL: 'EDUCATIONAL',
  SPIRITUAL: 'SPIRITUAL',
  CUSTOM: 'CUSTOM'
};

exports.BlogStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED'
};

exports.MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO'
};

exports.BookingStatus = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

exports.BookingPaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED'
};

exports.PaymentStatus = {
  CREATED: 'CREATED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  DISPUTED: 'DISPUTED'
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
 * Create the Client
 */
class PrismaClient {
  constructor() {
    throw new Error(
      `PrismaClient is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
    )
  }
}
exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
