# Changelog

All notable changes to the Param Adventures project will be documented in this file.

## [Phase 8] - 2025-12-31
### Added
- **Dynamic Testimonials**: API endpoint and frontend component for real-time customer feedback.
- **Trip Inquiries**: "Plan Your Dream Trip" form with backend persistence and phone number support.
- **Newsletter**: Subscription service with reactivation logic.
- **Admin Inquiries Page**: Dedicated dashboard to manage and update status of trip inquiries.
- **Unit Testing**: Jest setup with coverage for Inquiry and Auth services.
- **Developer Documentation**: Comprehensive `CONTRIBUTING.md` and overhauled architecture guides.

### Changed
- **Controller Standards**: Implemented `catchAsync` and `ApiResponse` utilities for better error handling and consistency.
- **Git Strategy**: Switched to structured feature-branching (`feature/`, `fix/`).

## [Phase 11] - Visual Enhancements & Templates
### Added
- **Trip Hero Redesign**: High-impact visual headers with mobile-optimized overlays.
- **Blog Templates**: JSON-driven design patterns for rich story-telling.
- **Image Tools**: Integration of `CroppedImageUploader` for better content control.

## [Phase 10] - Advanced Trip Management
### Added
- **Trip Lifecycle Engine**: Full DRAFT -> PENDING -> PUBLISHED workflow.
- **Role Portals**: Distinct dashboards for operational Managers and on-site Guides.
- **Post-Trip Flow**: Automated workflows for document uploads and experience reviews.

## [Phase 4] - Trip Domain & APIs
- State-driven trip lifecycle endpoints.
- Permission-guarded actions (`trip:publish`, `trip:approve`).
- Audit logging for all state transitions.

## [Phase 3] - Admin & Roles
- User and Role management APIs.
- Dedicated Admin dashboard (read-only and interactive role assignment).
- Role assignment safety guards (anti self-escalation).

## [Phase 2] - Infrastructure & Security
- **Asynchronous Jobs**: BullMQ and Redis integration for emails and heavy tasks.
- **Real-time**: Socket.io with Redis Pub/Sub for instant notifications.
- **Security**: Rate limiting, CSP headers, and Helmet integration.
- **Auth**: JWT Access/Refresh tokens with cookie-based session support.

## [Phase 1] - Billing & Operations
- **Payments**: Razorpay direct integration with HMAC verification.
- **Logistics**: `TRIP_MANAGER` and `TRIP_GUIDE` role implementations.
- **Multi-Guide Support**: Assignment logic for expeditions.

## [Phase 0] - Foundation
- Monorepo initialized (Next.js + Express).
- Prisma ORM setup (PostgreSQL).
- Base error handling and environment validation.
