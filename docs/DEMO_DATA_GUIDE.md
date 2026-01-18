# 🎬 Param Adventures - Demo Data & Testing Guide

## Overview

Your Param Adventures system is now populated with realistic demo data for testing, validation, and demonstration purposes. This guide covers everything you need to know about the seeded data and how to test the application.

---

## ✅ What Has Been Seeded

### 1. **6 Diverse Adventure Trips** 📍

#### Everest Base Camp Trek

- **Price**: $1,200 | **Duration**: 14 days | **Difficulty**: HARD
- **Location**: Everest Region, Nepal
- **Capacity**: 15 people
- **Features**:
  - Complete 14-day itinerary
  - Sherpa culture experience
  - Kala Patthar summit (sunrise views)
  - Real Unsplash cover images and gallery

#### Manali to Leh Bike Expedition

- **Price**: $850 | **Duration**: 10 days | **Difficulty**: HARD
- **Location**: Ladakh, India
- **Capacity**: 12 people
- **Features**:
  - Royal Enfield motorcycle experience
  - Cross 5 high-altitude passes (up to 5,359m)
  - Pangong Lake visit
  - Professional riding guides

#### Backwaters of Kerala Tour

- **Price**: $550 | **Duration**: 5 days | **Difficulty**: EASY
- **Location**: Kerala, India
- **Capacity**: 20 people
- **Features**:
  - Traditional houseboat cruises
  - Beach relaxation
  - Ayurveda spa
  - Spice plantation visits

#### Rishikesh White Water Rafting

- **Price**: $120 | **Duration**: 2 days | **Difficulty**: MODERATE
- **Location**: Rishikesh, India
- **Capacity**: 30 people
- **Features**:
  - Grade III & IV rapids
  - Cliff jumping (optional)
  - Beach camping
  - Evening bonfire

#### Nubra Valley Desert Trek

- **Price**: $380 | **Duration**: 4 days | **Difficulty**: MODERATE
- **Location**: Ladakh, India
- **Capacity**: 18 people
- **Features**:
  - Double-humped Bactrian camel safari
  - Sand dunes exploration
  - Diskit Monastery visit
  - Cold desert experience

#### Paragliding Adventure in Bir-Billing

- **Price**: $280 | **Duration**: 3 days | **Difficulty**: MODERATE
- **Location**: Himachal Pradesh, India
- **Capacity**: 16 people
- **Features**:
  - Tandem paragliding experience
  - Himalayan mountain views
  - Professional instructors
  - Video recording of flight

---

### 2. **6 Test Users** 👥

#### Admin User

```
Email: admin@paramadventures.com
Password: Demo@123
Role: ADMIN
Access: Full platform control, all dashboards
```

#### Guide Users (2)

```
Guide 1:
Email: guide1@paramadventures.com
Password: Demo@123
Name: Rahul Singh
Role: GUIDE

Guide 2:
Email: guide2@paramadventures.com
Password: Demo@123
Name: Priya Sharma
Role: GUIDE
```

#### Customer Users (3)

```
Customer 1:
Email: customer1@example.com
Password: Demo@123
Name: Amit Kumar
Bookings: 2 (1 Confirmed, 1 Pending)

Customer 2:
Email: customer2@example.com
Password: Demo@123
Name: Sarah Johnson
Bookings: 1 (Confirmed)

Customer 3:
Email: customer3@example.com
Password: Demo@123
Name: Sophia Chen
Bookings: 1 (Cancelled)
```

---

### 3. **Bookings & Reviews** 📅

#### Sample Bookings

- **Everest Trek**: 2 bookings (1 Confirmed with 2 participants, 1 Cancelled with 3 participants)
- **Manali-Leh Bike**: 1 confirmed booking (1 participant)
- **Kerala Backwaters**: 1 pending booking (4 participants)

#### Sample Reviews

- **Everest Trek**: ⭐⭐⭐⭐⭐ "Amazing trek! Views were breathtaking"
- **Manali-Leh Bike**: ⭐⭐⭐⭐☆ "Incredible bike experience. Challenging but rewarding"
- **Kerala Backwaters**: ⭐⭐⭐⭐⭐ "Best backwater experience! Highly recommend"

---

## 🌐 Testing & Validation Guide

### Running the Application Locally

#### 1. Start the API Server

```bash
cd apps/api
npm install  # if needed
npm run dev  # runs on http://localhost:3001
```

#### 2. Start the Web Application

```bash
cd apps/web
npm install  # if needed
npm run dev  # runs on http://localhost:3000
```

#### 3. Access the Platform

**Web Frontend**: http://localhost:3000
**API Documentation**: http://localhost:3001/docs (OpenAPI)

---

### Testing Scenarios

#### Scenario 1: Browse & Filter Trips

```
1. Open http://localhost:3000
2. Click "Browse Trips" or use search
3. Test filters:
   - By difficulty (EASY, MODERATE, HARD)
   - By price range ($120-$1200)
   - By duration
4. Verify images load correctly
5. Check trip details with itineraries
```

#### Scenario 2: Book a Trip (Customer Journey)

```
1. Login as customer1@example.com / Demo@123
2. Browse trips catalog
3. Click on "Everest Base Camp Trek"
4. Review details, itinerary, reviews
5. Click "Book Now"
6. Select dates and number of participants
7. Proceed to payment (use test Razorpay credentials if configured)
8. Confirm booking
9. Verify booking appears in dashboard
```

#### Scenario 3: Admin Operations

```
1. Login as admin@paramadventures.com / Demo@123
2. Access Admin Dashboard
3. View analytics:
   - Total trips: 6
   - Active users: 6
   - Total bookings: 4
   - Total revenue: $7,150
4. Manage trips:
   - View all 6 trips
   - Edit a trip details
   - Create a new trip
5. Manage users:
   - View all users
   - Edit user permissions
6. View bookings and payment history
```

#### Scenario 4: Guide Operations

```
1. Login as guide1@paramadventures.com / Demo@123
2. View "My Trips" dashboard
3. See assigned trips and upcoming bookings
4. View participant details
5. Send updates to trip participants
6. View earnings summary
```

#### Scenario 5: Review & Rating System

```
1. Login as a customer who has completed a trip
2. View completed bookings
3. Click "Leave Review"
4. Rate the trip (1-5 stars)
5. Write review comment
6. Submit review
7. Verify review appears on trip detail page
```

---

## 📸 Image & Media Details

### Cover Images

All trips have **real Unsplash images** for authentic visual experience:

- High-quality 1200x600px cover images
- Multiple gallery images (400x300px) for each trip
- Proper aspect ratios for responsive design
- No authentication needed (public URLs)

### Gallery Images Per Trip

- **Everest Trek**: 4 images
- **Manali-Leh Bike**: 2 images
- **Kerala Backwaters**: 2 images
- **Rishikesh Rafting**: 2 images
- **Nubra Valley**: 2 images
- **Paragliding**: 2 images

---

## 🗓️ Trip Dates & Availability

### Scheduled Trip Dates

```
March 2026:
- Rishikesh Rafting: Mar 1-3
- Everest Trek: Mar 15-29

April 2026:
- Kerala Backwaters: Apr 1-6

June 2026:
- Manali-Leh Bike: Jun 1-11

July 2026:
- Nubra Valley: Jul 15-19

September 2026:
- Paragliding: Sep 1-4
```

### Testing Booking Flow

When booking:

- Use dates within the scheduled ranges
- Test with different participant counts
- Verify capacity constraints (can't exceed max)
- Try different booking statuses (pending, confirmed, cancelled)

---

## 🔍 API Testing

### Public Endpoints (No Auth Required)

```bash
# List all trips
curl http://localhost:3001/api/v1/trips

# Get specific trip
curl http://localhost:3001/api/v1/trips/everest-base-camp-trek

# Get reviews for a trip
curl http://localhost:3001/api/v1/reviews?tripId=[ID]
```

### Authenticated Endpoints (Login Required)

```bash
# Create booking (requires JWT token)
POST http://localhost:3001/api/v1/bookings
{
  "tripId": "...",
  "participants": 2,
  "startDate": "2026-03-15"
}

# Leave review
POST http://localhost:3001/api/v1/reviews
{
  "tripId": "...",
  "rating": 5,
  "comment": "Great experience!"
}

# Get user bookings
GET http://localhost:3001/api/v1/bookings
```

---

## 💰 Payment Testing

### Test Razorpay Integration

If Razorpay webhook is configured:

**Test Payment Credentials** (Use Razorpay Test Mode):

- Card: 4111 1111 1111 1111
- Expiry: Any future date (e.g., 12/25)
- CVV: 123 (any 3 digits)

**Webhook Testing**:

```bash
# Test webhook endpoint
curl -X POST http://localhost:3001/api/v1/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.authorized",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "amount": 120000,
          "currency": "INR"
        }
      }
    }
  }'
```

---

## 📊 Database Queries for Verification

### Check Seeded Data

```sql
-- View all trips with images
SELECT id, title, price, difficulty, capacity FROM trip ORDER BY created_at DESC;

-- View all users and their roles
SELECT u.email, u.name, r.name as role
FROM user u
LEFT JOIN user_role ur ON u.id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.id;

-- View all bookings
SELECT b.id, t.title, u.name, b.participants, b.status, b.total_price
FROM booking b
JOIN trip t ON b.trip_id = t.id
JOIN user u ON b.user_id = u.id;

-- View reviews with ratings
SELECT r.rating, r.comment, u.name, t.title
FROM review r
JOIN user u ON r.user_id = u.id
JOIN trip t ON r.trip_id = t.id;
```

---

## ✨ Features to Test with Demo Data

### 1. **Trip Discovery**

- [ ] Browse all 6 trips with images
- [ ] Filter by difficulty level
- [ ] Search by location
- [ ] Sort by price
- [ ] View trip details with full itinerary
- [ ] Check reviews and ratings

### 2. **Booking System**

- [ ] Create new booking
- [ ] Select multiple participants
- [ ] Choose booking dates
- [ ] View booking status
- [ ] Cancel booking
- [ ] Download booking confirmation

### 3. **User Management**

- [ ] Register as new user
- [ ] Update user profile
- [ ] Change password
- [ ] View booking history
- [ ] Save favorite trips

### 4. **Admin Functions**

- [ ] View platform dashboard
- [ ] Manage trips (create, edit, delete)
- [ ] Manage users
- [ ] View analytics
- [ ] Handle bookings
- [ ] View payments

### 5. **Guide Features**

- [ ] View assigned trips
- [ ] See participant bookings
- [ ] Send group updates
- [ ] View earnings

### 6. **Content**

- [ ] Read trip itineraries
- [ ] View inclusions/exclusions
- [ ] Check packing lists
- [ ] Browse FAQs
- [ ] Read reviews

---

## 🎯 Performance Testing

### Load Testing Checklist

```
- [ ] Homepage loads in < 2s
- [ ] Trip catalog loads with all 6 trips
- [ ] Pagination works with bookings
- [ ] Images load without errors
- [ ] Search/filter doesn't timeout
- [ ] Booking creation < 3s
- [ ] Review submission < 2s
```

### Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile responsiveness (iOS/Android)
- [ ] Tablet view

---

## 📝 Notes for Demo Purposes

### Wireframe Reference

See `docs/WIREFRAME.md` for complete UI/UX design specifications including:

- Homepage layout
- Trip catalog filters
- Trip detail page structure
- Dashboard layouts for customers, guides, and admins
- Database schema
- API endpoints

### Demo Talking Points

1. **6 diverse trip offerings** across India and Nepal
2. **Multiple user roles** (Admin, Guide, Customer)
3. **Real booking workflow** with payment integration
4. **Complete reviews system** with ratings
5. **Production-grade images** from Unsplash
6. **Realistic pricing** ($120-$1,200 range)
7. **Full itineraries** with day-by-day breakdowns
8. **RBAC system** for different access levels

---

## 🔧 Troubleshooting

### Issue: Images Not Loading

**Solution**: Check if Unsplash URLs are accessible. They should load automatically since they're public URLs.

### Issue: Login Fails

**Solution**: Verify credentials match exactly (case-sensitive). Try: `admin@paramadventures.com` / `Demo@123`

### Issue: Bookings Not Showing

**Solution**:

1. Clear browser cache
2. Refresh the page
3. Check user is logged in
4. Verify booking is linked to correct user

### Issue: Database Conflicts

**Solution**: If seeding fails due to duplicate entries, run:

```bash
# Clear demo data
npx prisma db push --skip-generate

# Re-seed
node prisma/seed_demo_full.js
```

---

## 📞 Support

For issues or questions:

1. Check application logs: `npm run dev` (watch for errors)
2. Review database schema: `apps/api/prisma/schema.prisma`
3. Check API responses in browser DevTools Network tab
4. Review error messages in browser console

---

## 🚀 Next Steps

1. **Explore the demo data** - Test all features
2. **Validate UI/UX** - Use wireframe as reference
3. **Test payment flow** - If Razorpay configured
4. **Performance testing** - Check load times and responsiveness
5. **User acceptance testing** - Get feedback from stakeholders
6. **Production deployment** - Deploy with real data when ready

---

**Happy Testing! 🎉**

The platform is now fully functional with realistic demo data ready for comprehensive testing, validation, and demonstration purposes.
