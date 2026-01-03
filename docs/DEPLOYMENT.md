# Deployment Guide

This project is deployed across two main platforms:

## 1. Backend (Render.com)
The Node.js/Express API is hosted as a Web Service on Render.

### Environment Variables
The following secrets MUST be set in the Render Dashboard:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL Connection String |
| `JWT_SECRET` | Secret for signing Auth Tokens |
| `FRONTEND_URL` | URL of the deployed Vercel Frontend (for CORS) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `SENTRY_DSN` | Sentry DSN for Backend Error Tracking |

### Build & Start
- **Build Command**: `npm install && npm run build` (in root or specific app folder)
- **Start Command**: `npm start` (points to `dist/server.js`)

## 2. Frontend (Vercel)
The Next.js Application is hosted on Vercel.

### Environment Variables
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of the deployed Render Backend |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for Frontend |

## Troubleshooting
- **500 Error on Upload**: Usually missing Cloudinary Keys in Render. Check `CLOUDINARY_API_SECRET`.
- **CORS Error**: Ensure `FRONTEND_URL` in Render matches the Vercel Domain.
