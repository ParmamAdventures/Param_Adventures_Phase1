# 🚀 PARAM ADVENTURES - QUICK START & TEST DATA REFERENCE

## ⚡ Quick Start

### Start the Application
```bash
# Terminal 1 - API Server
cd apps/api
npm run dev  # http://localhost:3001

# Terminal 2 - Web App
cd apps/web
npm run dev  # http://localhost:3000
```

### Access Points
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **Docs**: http://localhost:3001/docs (OpenAPI)

---

## 🔐 Test Credentials (All Password: `Demo@123`)

### Admin
```
Email: admin@paramadventures.com
Password: Demo@123
Access: Full control, all dashboards, analytics
```

### Guides
```
guide1@paramadventures.com - Rahul Singh
guide2@paramadventures.com - Priya Sharma
Password: Demo@123 (both)
Access: View assigned trips, manage bookings, earnings
```

### Customers
```
customer1@example.com - Amit Kumar (2 bookings)
customer2@example.com - Sarah Johnson (1 booking)
customer3@example.com - Sophia Chen (1 booking)
Password: Demo@123 (all)
Access: Browse trips, make bookings, leave reviews
```

---

## 🌍 Demo Trips Loaded

| Trip | Price | Duration | Difficulty | Capacity |
|------|-------|----------|-----------|----------|
| Everest Base Camp Trek | $1,200 | 14 days | HARD | 15 |
| Manali-Leh Bike Expedition | $850 | 10 days | HARD | 12 |
| Kerala Backwaters Tour | $550 | 5 days | EASY | 20 |
| Rishikesh Rafting | $120 | 2 days | MODERATE | 30 |
| Nubra Valley Trek | $380 | 4 days | MODERATE | 18 |
| Paragliding Bir-Billing | $280 | 3 days | MODERATE | 16 |

**Total**: 6 trips | All with images, itineraries, reviews

---

## 📊 Sample Data Summary

- **6 Diverse Trips** - Multiple adventure types
- **6 Users** - 1 admin, 2 guides, 3 customers
- **4 Bookings** - Various statuses (confirmed, pending, cancelled)
- **3 Reviews** - Customer feedback with 4-5 star ratings
- **Real Images** - Unsplash gallery for each trip
- **Complete Itineraries** - Day-by-day breakdowns
- **Pricing Range** - $120 to $1,200

---

## 🧪 Quick Test Scenarios

### Test 1: Browse & Book (2 min)
```
1. Login as customer1@example.com
2. Go to Trips → Search "Everest"
3. Click trip → View itinerary
4. Click "Book Now" → Select dates
5. Proceed to checkout
6. Verify booking in dashboard
```

### Test 2: Admin Dashboard (2 min)
```
1. Login as admin@paramadventures.com
2. Go to Admin → Dashboard
3. View: 6 trips, 6 users, 4 bookings, $7,150 revenue
4. Check analytics and charts
5. Browse trip management
```

### Test 3: Leave Review (1 min)
```
1. Login as customer (any account)
2. Go to Dashboard → Bookings
3. Click "Leave Review" on any trip
4. Rate 1-5 stars & add comment
5. Submit & see review on trip page
```

### Test 4: Guide Dashboard (1 min)
```
1. Login as guide1@paramadventures.com
2. View My Trips → See assigned trips
3. View Bookings → See participants
4. Check earnings summary
```

---

## 📱 Key Features to Test

- [ ] **Trip Discovery** - Browse, filter, search all 6 trips
- [ ] **Booking Flow** - Create, view, cancel bookings
- [ ] **Reviews** - Leave and view reviews with ratings
- [ ] **Admin Panel** - Manage trips, users, bookings
- [ ] **Guide Dashboard** - View trips and participants
- [ ] **User Profiles** - Update profile and preferences
- [ ] **Payment** - Process payment (if Razorpay configured)
- [ ] **Images** - All trip images and galleries load
- [ ] **Responsiveness** - Mobile, tablet, desktop
- [ ] **Performance** - Pages load quickly

---

## 🎯 Sample Data Breakdown

### Bookings
- Everest Trek: 2 bookings (1 confirmed, 1 cancelled)
- Manali-Leh Bike: 1 confirmed
- Kerala Backwaters: 1 pending
- Total: 4 bookings | 8 participants | $7,150 revenue

### Reviews
- Everest Trek: ⭐⭐⭐⭐⭐ "Amazing trek!"
- Manali-Leh Bike: ⭐⭐⭐⭐☆ "Incredible bike experience"
- Kerala Backwaters: ⭐⭐⭐⭐⭐ "Best backwater experience"

### Trip Dates
- March 2026: Rishikesh Rafting, Everest Trek
- April 2026: Kerala Backwaters
- June 2026: Manali-Leh Bike
- July 2026: Nubra Valley
- September 2026: Paragliding

---

## 📚 Documentation Files

- **WIREFRAME.md** - Complete UI/UX design specifications
- **DEMO_DATA_GUIDE.md** - Detailed testing guide
- **TESTING_STRATEGY.md** - Automated test execution guide
- **API_GUIDE.md** - API endpoint documentation

---

## 🔧 Useful Commands

```bash
# Reseed demo data (if needed)
cd apps/api
node prisma/seed_demo_full.js

# Run API tests
npm run test

# Run web tests
cd apps/web
npm run test

# Check database
npx prisma studio
```

---

## 🎬 Demo Script (5 minutes)

1. **Homepage** (1 min)
   - Show hero section
   - Highlight featured trips
   - Demo search functionality

2. **Trip Catalog** (1 min)
   - Filter by difficulty
   - Search by location
   - Show trip cards with images

3. **Trip Details** (1 min)
   - Full itinerary view
   - Gallery images
   - Customer reviews

4. **Booking** (1 min)
   - Select trip and dates
   - Choose participants
   - Proceed to payment

5. **Admin Panel** (1 min)
   - Dashboard metrics
   - Trip management
   - User analytics

---

## 💡 Demo Tips

- **Performance**: All pages optimized, images use Unsplash CDN
- **Realism**: Pricing matches real adventure tour costs
- **Completeness**: Each trip has full itinerary and details
- **Mobile**: Fully responsive design
- **Navigation**: Intuitive user flows for all roles

---

## 📞 Need Help?

**To reseed data:**
```bash
cd apps/api
node prisma/seed_demo_full.js
```

**To reset everything:**
```bash
npm run db:push
node prisma/seed_demo_full.js
```

**Check logs:**
```bash
npm run dev  # Watch console for errors
```

---

**Last Updated**: January 2026
**Demo Data Version**: 1.0
**Status**: ✅ Ready for Testing & Validation
