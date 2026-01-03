# Param Adventures - System Architecture

## Overview
Param Adventures is a modern Adventure Tourism platform built with a robust tech stack designed for scalability, performance, and user experience.

## Technology Stack

### Frontend (Client)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI (Radix Primitives)
- **State Management**: React Context (AuthContext)
- **Deployment**: Vercel

### Backend (Server)
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase/Neon)
- **ORM**: Prisma
- **Deployment**: Render (Web Service)

### Infrastructure & Services
- **Storage**: Cloudinary (Image & Video Optimization)
- **Monitoring**: Sentry (Error Tracking & Performance)
- **Authentication**: JWT (HttpOnly Cookies)

## Key Components

### 1. Media Handling (Cloudinary)
We use a unified `upload` middleware (`apps/api/src/middlewares/upload.middleware.ts`) that streams files directly to Cloudinary.
- **Images**: Automatically resized and optimized.
- **Videos**: Uploaded raw for speed, then optimized on-demand using dynamic URLs (`q_auto`, `f_auto`).
- **Storage Strategy**: `multer-storage-cloudinary` restricts file types and organizes uploads into folders (`param_adventures_uploads/images` vs `videos`).

### 2. Database Schema (Prisma)
- **User**: Core entity with RBAC (Roles: ADMIN, GUIDE, USER).
- **Trip**: Central entity containing Itinerary, Gallery (Images), and Bookings.
- **Image**: Polymorphic-style table storing Cloudinary URLs for usage across the app (User Avatar, Trip Cover, Gallery).

### 3. Error Handling
- **Global Error Handler**: Catches async errors.
- **Sentry**: Captures unhandled exceptions in Production.
- **Validation**: Zod (planned/partial) and Manual Request validation.

## Directory Structure
- `apps/web`: Next.js Frontend
- `apps/api`: Express Backend
- `packages`: Shared libraries (if logic expands)
