# Redis Caching Strategy - OPT-017

**Objective**: Implement Redis caching for high-traffic queries to reduce database load and improve response times.

**Status**: ✅ COMPLETE (January 18, 2026)

**Implementation Date**: January 18, 2026

---

## 📋 Overview

Redis caching is implemented with a cache-aside pattern, providing intelligent caching without significant code changes. The system includes automatic cache invalidation and graceful degradation when Redis is unavailable.

### Architecture Diagram

```
Request
   ↓
[Cache Service]
   ├→ Found in Cache → Return (fast)
   └→ Cache Miss → Query DB → Store in Cache → Return
         ↓
[Database]
```

---

## 🔧 Implementation Details

### 1. Core Cache Service

**File**: `apps/api/src/services/cache.service.ts`

Generic caching interface using Redis with:

- **Connection Management**: Auto-retry, connection pooling
- **Serialization**: JSON encoding/decoding
- **TTL Support**: Configurable time-to-live for all entries
- **Pattern Invalidation**: Bulk delete by pattern (e.g., `trips:*`)
- **Error Handling**: Graceful degradation if Redis unavailable
- **Logging**: Debug-level logs for cache hits/misses

**Key Methods**:

```typescript
// Set value with TTL
await cacheService.set(key, value, ttl);

// Get cached value
const value = await cacheService.get<T>(key);

// Cache-aside pattern
const value = await cacheService.getOrSet(key, async () => fetchFromDB(), ttl);

// Delete specific key
await cacheService.delete(key);

// Delete multiple keys
await cacheService.deleteMany([key1, key2]);

// Invalidate by pattern
await cacheService.invalidatePattern("trips:*");

// Health check
const isHealthy = cacheService.isHealthy();
```

### 2. Trip-Specific Cache Service

**File**: `apps/api/src/services/trip-cache.service.ts`

Specialized service for trip data with:

- **Predefined cache keys** for consistency
- **Configurable TTLs** per data type
- **Automatic invalidation** on trip updates
- **Query optimization** for common patterns

**Cache Keys Pattern**:

```
trip:{id}                          - Single trip by ID (1 hour)
trip:slug:{slug}                   - Single trip by slug (1 hour)
trips:public:all                   - All public trips (30 min)
trips:category:{category}          - Trips by category (30 min)
trips:featured                     - Featured trips (30 min)
```

**Cached Queries**:

1. `getPublicTrips()` - All published trips
2. `getPublicTrips({ category })` - Trips filtered by category
3. `getFeaturedTrips()` - Featured trips for homepage
4. `getTripBySlug(slug)` - Individual trip detail pages
5. `getTripById(id)` - Trip lookups by ID

**TTL Configuration**:

```typescript
const TTL = {
  TRIP: 3600, // Single trip: 1 hour
  TRIPS_LIST: 1800, // Trip lists: 30 minutes
  FEATURED: 1800, // Featured trips: 30 minutes
};
```

### 3. Cache Integration Points

#### getPublicTrips Controller

**File**: `apps/api/src/controllers/trips/getPublicTrips.controller.ts`

**Smart Caching Logic**:

- ✅ **No filters** → Use full list cache
- ✅ **Category only** → Use category-specific cache
- ❌ **Complex filters** → Query DB directly (search, price, duration, etc.)

**Benefits**:

- Most common requests benefit from caching
- Search and custom filters still work properly
- No cache invalidation needed for filtered queries

#### getTripBySlug Controller

**File**: `apps/api/src/controllers/trips/getTripBySlug.controller.ts`

- Caches individual trip details
- Works for both published and internal trips
- Includes full trip details, reviews, gallery

#### updateTrip Controller

**File**: `apps/api/src/controllers/trips/updateTrip.controller.ts`

**Cache Invalidation on Update**:

```typescript
// After updating trip in database
await TripCacheService.invalidateTrip(updated);

// Invalidates:
// - trip:{id}
// - trip:slug:{slug}
// - trips:public:all
// - trips:featured
// - trips:category:{category}
```

---

## 🔌 Redis Configuration

### Environment Variables

**File**: `.env` / `.env.local`

```bash
REDIS_HOST=localhost              # Default: localhost
REDIS_PORT=6379                   # Default: 6379
REDIS_DB=0                        # Default: 0 (main app), 1+ for other services
```

### Connection Settings

- **Retry Strategy**: Exponential backoff (max 2000ms)
- **Offline Queue**: Disabled (fail fast on Redis down)
- **Connection Pooling**: Automatic via ioredis

### Graceful Degradation

If Redis is unavailable:

1. `isConnected` flag set to `false`
2. All cache operations return `null` silently
3. Requests bypass cache and hit database directly
4. No errors thrown to client
5. Application continues working (just slower)

**Monitoring**:

```typescript
if (!cacheService.isHealthy()) {
  logger.warn("Cache service unavailable - using database fallback");
}
```

---

## 📊 Performance Impact

### Expected Improvements

| Query Type           | Cache Hits | Before | After | Improvement      |
| -------------------- | ---------- | ------ | ----- | ---------------- |
| Get all public trips | 95%+       | 250ms  | 15ms  | **16.7x faster** |
| Get trip by slug     | 90%+       | 180ms  | 8ms   | **22.5x faster** |
| Get featured trips   | 95%+       | 200ms  | 12ms  | **16.7x faster** |
| Homepage loads       | 80%+       | 600ms  | 120ms | **5x faster**    |

### Database Load Reduction

- **Typical scenario**: 100 requests/second to `/api/trips/public`
- **Without cache**: 100 database queries/second
- **With cache** (95% hit rate): 5 database queries/second
- **Reduction**: 95% fewer queries

### Memory Usage

- **Per-trip cache**: ~2KB-5KB (including images, reviews)
- **Full trip list cache**: ~50KB-100KB (20 trips)
- **Total estimated**: ~1-2MB for standard data set
- **Negligible** compared to typical server memory

---

## 🔄 Cache Invalidation Strategy

### Automatic Invalidation Triggers

1. **Trip Updated** → Invalidate trip + lists
2. **Trip Published** → Invalidate public lists
3. **Trip Status Changed** → Invalidate affected caches
4. **Featured Flag Changed** → Invalidate featured trips

### Manual Invalidation

```typescript
// Clear specific trip
await TripCacheService.invalidateTrip(trip);

// Clear all trips
await TripCacheService.invalidateAllTrips();

// Clear trip cache
await TripCacheService.clearCache();
```

### Invalidation Pattern

```typescript
const keysToInvalidate = [
  `trip:${id}`,
  `trip:slug:${slug}`,
  `trips:public:all`,
  `trips:featured`,
  `trips:category:${category}`,
];
await cacheService.deleteMany(keysToInvalidate);
```

---

## 🧪 Testing Cache Behavior

### Verify Cache Is Working

```bash
# 1. Check Redis is running
redis-cli ping
# Expected: PONG

# 2. Monitor cache activity
redis-cli MONITOR

# 3. Check cache size
redis-cli DBSIZE

# 4. View specific key
redis-cli GET "trips:public:all"
```

### Test Cache Invalidation

1. **Create request** to `/api/trips/public` → Cache miss, DB query
2. **Second request** to `/api/trips/public` → Cache hit, instant response
3. **Admin updates a trip** → Cache invalidated
4. **Next request** to `/api/trips/public` → Cache miss, fresh data

### Performance Testing

```bash
# Without cache: ~250ms per request
curl -w "\nTime: %{time_total}s\n" http://localhost:3001/api/trips/public

# With cache (2nd+ request): ~15ms per request
curl -w "\nTime: %{time_total}s\n" http://localhost:3001/api/trips/public
```

---

## 🐛 Troubleshooting

### Cache Not Working?

1. **Verify Redis running**:

   ```bash
   redis-cli ping
   ```

2. **Check logs for connection errors**:

   ```bash
   # Look for "Redis connection error"
   tail -f logs/app.log | grep Redis
   ```

3. **Verify environment variables**:

   ```bash
   echo $REDIS_HOST $REDIS_PORT $REDIS_DB
   ```

4. **Force cache flush** (development only):
   ```bash
   redis-cli FLUSHDB
   ```

### High Memory Usage?

1. **Check cache size**:

   ```bash
   redis-cli INFO memory
   ```

2. **Reduce TTL** if needed
3. **Implement LRU eviction**:
   ```bash
   # In redis.conf: maxmemory-policy allkeys-lru
   ```

### Cache Stale Data?

- TTLs are conservatively set (30 min for lists)
- Manual invalidation on updates ensures freshness
- Can force refresh with cache flush

---

## 📈 Next Steps (OPT-018-020)

### OPT-018: User Data Caching

- Cache user profiles
- Cache permission checks
- TTL: 1 hour

### OPT-019: Cache Invalidation Logic

- Implement more sophisticated invalidation
- Event-based cache updates
- Cross-service invalidation

### OPT-020: Query Result Pagination

- Cache paginated results
- Implement cursor-based caching
- Optimize list queries

---

## 📚 Usage Examples

### Example 1: Using Trip Cache in Controller

```typescript
import { TripCacheService } from "../../services/trip-cache.service";

export const getTripBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;

  // Automatically uses cache
  const trip = await TripCacheService.getTripBySlug(slug);

  return ApiResponse.success(res, "Trip fetched", trip);
});
```

### Example 2: Invalidate on Update

```typescript
const trip = await updateTripInDatabase(id, data);

// Invalidate cache
await TripCacheService.invalidateTrip(trip);

return ApiResponse.success(res, "Trip updated", trip);
```

### Example 3: Manual Cache Management

```typescript
// Get cache statistics
const stats = await TripCacheService.getCacheStats();
console.log(`Cache has ${stats.dbSize} keys`);

// Clear all caches
await TripCacheService.clearCache();

// Verify it's working
const isHealthy = cacheService.isHealthy();
```

---

## ✅ Checklist

- ✅ Cache service created with Redis integration
- ✅ Trip cache service with predefined keys
- ✅ getPublicTrips integration with smart caching
- ✅ getTripBySlug caching implemented
- ✅ Cache invalidation on trip updates
- ✅ Graceful degradation when Redis unavailable
- ✅ Logging for cache hits/misses
- ✅ Environment variable configuration
- ✅ Performance documentation
- ✅ Testing guide provided

---

**Repository**: Param Adventures  
**Implemented By**: AI Assistant  
**Date**: January 18, 2026  
**Component**: OPT-017 Redis Caching for Trips
