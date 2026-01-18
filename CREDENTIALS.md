# DEMO CREDENTIALS - QUICK REFERENCE

## 🔑 Credentials Cheat Sheet

| Role               | Email                       | Password    | Access Level         |
| ------------------ | --------------------------- | ----------- | -------------------- |
| **Super Admin**    | admin@paramadventures.com   | Admin@123   | Full Access          |
| **Manager**        | manager@paramadventures.com | Manager@123 | Full Access          |
| **Content Writer** | writer@paramadventures.com  | Writer@123  | Create/Publish Blogs |
| **Guide**          | guide@paramadventures.com   | Guide@123   | Guide Trips          |
| **User 1**         | user1@example.com           | User@123    | Browse & Book        |
| **User 2**         | user2@example.com           | User@123    | Browse & Book        |

---

## 🚀 Quick Start

### 1. Start the Application

```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web
cd apps/web
npm run dev
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

### 3. Login with Demo Credentials

Use any credentials above to test different roles

---

## ✨ What's Included

### ✅ 7 Published Trips

- Everest Base Camp Trek
- Manali to Leh Expedition
- Kerala Backwaters Tour
- Rishikesh Rafting
- Bir-Billing Paragliding
- Nubra Valley Desert Trek
- E2E Test Expedition

### ✅ 5 Published Blog Posts

1. Everest Trek Experience
2. Kerala Backwaters Guide
3. Manali to Leh Road Trip
4. Paragliding Adventure
5. Rishikesh White Water Rafting

### ✅ 6 Demo Users

- 2 Admins (full access)
- 1 Content Creator (write blogs)
- 1 Guide (lead trips)
- 2 Regular Users (book trips)

### ✅ Complete Role-Based Access Control

- Admin Dashboard
- Blog Management
- Trip Booking System
- User Management

---

## 🎯 Test These Features

### 1. Admin Login

- Email: admin@paramadventures.com
- Password: Admin@123
- Access: Full admin dashboard, all trips, all users, all bookings

### 2. Content Creator Login

- Email: writer@paramadventures.com
- Password: Writer@123
- Access: Create and publish blog posts

### 3. Regular User Login

- Email: user1@example.com
- Password: User@123
- Access: Browse trips, read blogs, book expeditions

### 4. Public Access (No Login)

- Browse all trips
- Read all published blogs
- View trip details
- Explore expeditions

---

## 🔗 Key URLs

| Feature            | URL                                |
| ------------------ | ---------------------------------- |
| Home               | http://localhost:3000              |
| Expeditions        | http://localhost:3000/trips        |
| Journal            | http://localhost:3000/blogs        |
| Admin Panel        | http://localhost:3000/admin        |
| API (Public Trips) | http://localhost:3001/trips/public |
| API (Public Blogs) | http://localhost:3001/blogs/public |

---

## 🛠️ Setup Commands

### If Data is Missing or Corrupted

```bash
cd apps/api

# Seed all demo data
node prisma/seed_demo_data.js

# Fix admin permissions
node prisma/fix_admin_access.js

# Diagnose any issues
node prisma/diagnose.js
```

---

## 💡 Demo Stories

### Story 1: Browse & Book a Trip

1. Don't login (public access)
2. Go to /trips
3. Browse the 7 published expeditions
4. Click on "Everest Base Camp Trek"
5. View all details

### Story 2: Read Travel Blogs

1. Don't login (public access)
2. Go to /blogs or home page
3. Browse the 5 published blog posts
4. Click on "My First Everest Base Camp Trek"
5. Read the full article

### Story 3: Admin Management

1. Login as admin@paramadventures.com / Admin@123
2. Go to /admin
3. View all trips, users, bookings
4. Manage content and permissions

### Story 4: Create Blog Content

1. Login as writer@paramadventures.com / Writer@123
2. Go to /dashboard
3. Create a new blog post
4. Publish and see it go live

---

## ✅ Everything is Ready!

All demo data has been loaded:

- ✅ 7 published trips
- ✅ 5 published blogs
- ✅ 6 demo users with different roles
- ✅ Full permission system
- ✅ Admin dashboard fully functional
- ✅ Frontend showing all content

---

**Enjoy exploring Param Adventures!** 🏔️✨
