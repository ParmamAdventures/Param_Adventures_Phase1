# Param Adventures - Demo Setup Guide

## 🚀 Overview

This document provides all demo credentials and information about the setup for **Param Adventures Phase 1**.

---

## 🔐 Demo User Credentials

### Super Admin (Full Access)

```
Email:    admin@paramadventures.com
Password: Admin@123
Name:     Admin User
Role:     ADMIN
```

### Manager/Travel Administrator

```
Email:    manager@paramadventures.com
Password: Manager@123
Name:     Travel Manager
Role:     ADMIN
```

### Content Creator (Blog Writer)

```
Email:    writer@paramadventures.com
Password: Writer@123
Name:     Sarah Johnson
Role:     CONTENT_CREATOR
```

### Trip Guide

```
Email:    guide@paramadventures.com
Password: Guide@123
Name:     Rajesh Kumar
Role:     GUIDE
```

### Regular User 1

```
Email:    user1@example.com
Password: User@123
Name:     Alex Thompson
Role:     USER
```

### Regular User 2

```
Email:    user2@example.com
Password: User@123
Name:     Priya Sharma
Role:     USER
```

---

## 📚 Role-Based Permissions

### ADMIN Role

- ✅ Access admin dashboard
- ✅ Manage all users
- ✅ Manage trips (create, edit, delete)
- ✅ View all bookings
- ✅ Manage and publish blogs
- ✅ View audit logs
- ✅ Access all admin features

### CONTENT_CREATOR Role

- ✅ Create and edit blog posts
- ✅ Publish their own blogs
- ✅ Submit blogs for review
- ✅ View public content

### GUIDE Role

- ✅ Guide trips
- ✅ View bookings
- ✅ Book trips
- ✅ View public content

### USER Role

- ✅ Browse and book trips
- ✅ View own bookings
- ✅ Update profile
- ✅ Access public content

---

## 📊 Demo Data Included

### Published Trips (7 Total)

1. **E2E Test Expedition** - Testing expedition
2. **Everest Base Camp Trek** - 12 days, $2,499
3. **Manali to Leh Bike Expedition** - 5 days, $1,899
4. **Backwaters of Kerala Tour** - 7 days, $1,299
5. **Rishikesh White Water Rafting** - 3 days, $499
6. **Nubra Valley Desert Trek** - 4 days, $899
7. **Paragliding Adventure in Bir-Billing** - 2 days, $599

### Published Blog Posts (5 Total)

#### 1. "My First Everest Base Camp Trek - A Life-Changing Journey"

- Author: Sarah Johnson (Content Creator)
- Slug: `everest-base-camp-experience`
- Topic: Trek experience, preparation tips, itinerary details

#### 2. "Hidden Gems in Kerala Backwaters: Off the Beaten Path"

- Author: Rajesh Kumar (Guide)
- Slug: `kerala-backwaters-hidden-gems`
- Topic: Local insights, best time to visit, photography

#### 3. "Manali to Leh Expedition: Road Trip Diaries"

- Author: Sarah Johnson (Content Creator)
- Slug: `manali-leh-road-trip`
- Topic: Motorcycle journey, high passes, essential tips

#### 4. "Paragliding in Bir-Billing: Soaring Over the Himalayas"

- Author: Rajesh Kumar (Guide)
- Slug: `paragliding-bir-billing`
- Topic: First flight experience, beginner guide

#### 5. "White Water Rafting in Rishikesh: Adventure on the Ganges"

- Author: Sarah Johnson (Content Creator)
- Slug: `rishikesh-white-water-rafting`
- Topic: Rapids guide, what to expect, safety

---

## 🌐 Application URLs

### Frontend

- **Homepage**: http://localhost:3000
- **Expeditions (Trips)**: http://localhost:3000/trips
- **Journal (Blogs)**: http://localhost:3000/blogs
- **Dashboard**: http://localhost:3000/admin
- **Admin Panel**: http://localhost:3000/admin/trips

### API

- **Base URL**: http://localhost:3001
- **Public Trips**: http://localhost:3001/trips/public
- **Public Blogs**: http://localhost:3001/blogs/public
- **API Docs**: http://localhost:3001/api-docs

---

## 🎯 Testing Scenarios

### Admin Dashboard

1. Login with `admin@paramadventures.com` / `Admin@123`
2. Access admin dashboard at http://localhost:3000/admin
3. View all trips, bookings, users, and blogs

### Content Creation

1. Login with `writer@paramadventures.com` / `Writer@123`
2. Create, edit, and publish blog posts
3. Submit blogs for admin review

### Trip Booking

1. Login with `user1@example.com` / `User@123`
2. Browse trips at http://localhost:3000/trips
3. Book a trip and view booking details

### Read Blogs

1. Visit http://localhost:3000/blogs
2. Read published blog posts
3. View blog details with reading time

---

## 🔧 Database Setup Commands

### Run All Seeds

```bash
cd apps/api
npm run seed
```

### Run Demo Data Seed Only

```bash
cd apps/api
node prisma/seed_demo_data.js
```

### Fix Admin Access

```bash
cd apps/api
node prisma/fix_admin_access.js
```

### Diagnose Issues

```bash
cd apps/api
node prisma/diagnose.js
```

---

## 📱 Frontend Features Enabled

- ✅ **Homepage** - Hero section, featured trips, blog showcase
- ✅ **Trips/Expeditions** - Browse all published trips
- ✅ **Journal/Blogs** - Read travel stories and guides
- ✅ **Admin Dashboard** - Manage trips, users, bookings
- ✅ **Authentication** - Login with demo credentials
- ✅ **Responsive Design** - Mobile-friendly interface

---

## 🐛 Troubleshooting

### Blogs Not Showing

1. Verify blogs are published in database:
   ```bash
   node prisma/diagnose.js
   ```
2. Check API is returning blogs:
   ```bash
   curl http://localhost:3001/blogs/public
   ```
3. Verify frontend environment variables are set correctly

### Admin Can't Access Dashboard

1. Ensure user has ADMIN role
2. Verify admin:dashboard permission is assigned
3. Run: `node prisma/fix_admin_access.js`

### Trips Not Visible

1. Check trips have PUBLISHED status
2. Verify trips were seeded properly
3. Clear browser cache and refresh

---

## 📝 Notes

- All demo passwords are secure and suitable for testing
- Demo data is reset with each seed command
- Blogs and trips are fully functional and ready for demo
- Admin dashboard includes all management features
- Role-based access control is fully enforced

---

## ✨ Key Features Demonstrated

- **Authentication & Authorization** - JWT tokens, role-based access
- **Admin Dashboard** - Full CRUD operations
- **Blog System** - Create, edit, publish, and view blogs
- **Trip Management** - Browse, book, and manage expeditions
- **Responsive UI** - Mobile-first design with animations
- **Database** - PostgreSQL with Prisma ORM
- **API** - Express.js with comprehensive endpoints

---

_Last Updated: January 18, 2026_
