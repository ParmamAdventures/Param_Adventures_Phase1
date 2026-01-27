/**
 * TYPESCRIPT LINT ERROR FIXES FOR PARAM ADVENTURES WEB APP
 *
 * This document provides all necessary fixes to resolve ESLint "Unexpected any" errors
 * Run these fixes manually in VS Code since auto-replace tools are disabled
 *
 * After each fix, the lint count should decrease
 */

// ============================================================================
// FILE 1: apps/web/next.config.ts
// ============================================================================
// ISSUE: Line 3 - "@ts-ignore" deprecated
// FIX: Replace @ts-ignore with @ts-expect-error

// BEFORE (Line 1-4):
// import type { NextConfig } from "next";
//
// // @ts-ignore
// import { withSentryConfig } from "@sentry/nextjs";

// AFTER (Line 1-4):
// import type { NextConfig } from "next";
//
// // @ts-expect-error - Sentry types compatibility
// import { withSentryConfig } from "@sentry/nextjs";

// ============================================================================
// FILE 2: apps/web/src/components/trips/TripsClient.tsx
// ============================================================================
// ISSUE: Line 19 - useState<any[]>
// FIX: Replace with Trip[] type

// BEFORE (Line 1-25):
// "use client";
// import React, { useEffect, useState, useCallback } from "react";
// import TripsGrid from "./TripsGrid";
// import { TripsGridSkeleton } from "./TripsGridSkeleton";
// import { apiFetch } from "../../lib/api";
// import { Filter, X } from "lucide-react";
// import TripFilters from "./TripFilters";
// import { useTripFilters } from "@/hooks/useTripFilters";
// import { useAuth } from "@/context/AuthContext";
//
// export default function TripsClient() {
//   const [trips, setTrips] = useState<any[] | null>(null);

// AFTER (Line 1-25):
// "use client";
// import React, { useEffect, useState, useCallback } from "react";
// import TripsGrid from "./TripsGrid";
// import { TripsGridSkeleton } from "./TripsGridSkeleton";
// import { apiFetch } from "../../lib/api";
// import { Filter, X } from "lucide-react";
// import TripFilters from "./TripFilters";
// import { useTripFilters } from "@/hooks/useTripFilters";
// import { useAuth } from "@/context/AuthContext";
// import { Trip } from "@/types/trip";
//
// export default function TripsClient() {
//   const [trips, setTrips] = useState<Trip[] | null>(null);

// ============================================================================
// FILE 3: apps/web/src/components/trips/TripsGrid.tsx
// ============================================================================
// ISSUE: Line 15 - trips: any[]
// FIX: Replace with Trip[] type

// BEFORE (Line 13-16):
// export default function TripsGrid({ trips, savedTripIds }: { trips: any[], savedTripIds?: Set<string> }) {

// AFTER (Line 13-16):
// import { Trip } from "@/types/trip";
//
// export default function TripsGrid({ trips, savedTripIds }: { trips: Trip[], savedTripIds?: Set<string> }) {

// ============================================================================
// FILE 4: apps/web/src/components/blogs/BlogsClient.tsx
// ============================================================================
// ISSUE: Lines 16, 36, 122 - Multiple any types
// FIX: Replace with Blog type and proper error handling

// BEFORE (Line 16):
//   const [blogs, setBlogs] = useState<any[] | null>(null);

// AFTER (Line 16):
//   const [blogs, setBlogs] = useState<Blog[] | null>(null);

// ADD IMPORT at top:
// import { Blog } from "@/types/blog";

// BEFORE (Line 36):
//     } catch (err: any) {
//       setError(err.message);

// AFTER (Line 36):
//     } catch (err) {
//       const error = err instanceof Error ? err : new Error(String(err));
//       setError(error.message);

// BEFORE (Line 122):
//     {blogs.map((blog: any, index: number) => (

// AFTER (Line 122):
//     {blogs.map((blog: Blog, index: number) => (

// ============================================================================
// FILE 5: apps/web/src/components/bookings/BookingList.tsx
// ============================================================================
// ISSUE: Lines 176, 214 - (window as any)
// FIX: Replace with Record<string, string>

// BEFORE (Line 176):
//   (window as any)[`order_${booking.id}`] = result.orderId;

// AFTER (Line 176):
//   (window as Record<string, string>)[`order_${booking.id}`] = result.orderId;

// BEFORE (Line 214):
//   simulateDevSuccess(booking.id, (window as any)[`order_${booking.id}`])

// AFTER (Line 214):
//   simulateDevSuccess(booking.id, (window as Record<string, string>)[`order_${booking.id}`])

// ============================================================================
// FILE 6: apps/web/src/components/admin/GlobalBookingList.tsx
// ============================================================================
// ISSUE: Line 55 - setSelectedBookingForPayment<any>
// FIX: Use Booking type from types/booking.ts

// BEFORE (Line 55):
//   const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<any>(null);

// AFTER (Line 55):
//   const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);

// ADD IMPORT:
// import { Booking } from "@/types/booking";

// ============================================================================
// FILE 7: apps/web/src/app/login/page.tsx
// ============================================================================
// ISSUE: Line 30 - catch (err: any)
// FIX: Use proper error handling

// BEFORE (Line 30):
//     } catch (err: any) {
//       setError(err.message || "Invalid email or password");

// AFTER (Line 30):
//     } catch (err) {
//       const error = err instanceof Error ? err : new Error(String(err));
//       setError(error.message || "Invalid email or password");

// ============================================================================
// FILE 8: apps/web/src/app/signup/page.tsx
// ============================================================================
// ISSUE: Lines 57, 67 - Multiple any types
// FIX: Replace with proper types and error handling

// BEFORE (Line 57):
//   const details = Object.entries(data.details)
//     .map(([field, msgs]: any) => `${field}: ${msgs.join(", ")}`)`

// AFTER (Line 57):
//   const details = Object.entries(data.details as Record<string, string[]>)
//     .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)`

// BEFORE (Line 67):
//     } catch (err: any) {
//       setError(err.message || "Something went wrong.");

// AFTER (Line 67):
//     } catch (err) {
//       const error = err instanceof Error ? err : new Error(String(err));
//       setError(error.message || "Something went wrong.");

// ============================================================================
// FILE 9: apps/web/src/hooks/useTripFilters.ts
// ============================================================================
// ISSUE: Line 60 - setFilter(key, value: any)
// FIX: Replace any with union of allowed filter value types

// BEFORE (Line 60):
//   const setFilter = useCallback((key: keyof TripFiltersState, value: any) => {

// AFTER (Line 60):
//   const setFilter = useCallback((key: keyof TripFiltersState, value: string | number | boolean) => {

// ============================================================================
// FILE 10: apps/web/src/hooks/useUpload.ts
// ============================================================================
// ISSUE: Lines 6, 45 - Multiple any types
// FIX: Replace with Record<string, unknown> and proper error handling

// BEFORE (Line 6):
//   onSuccess?: (data: any) => void;

// AFTER (Line 6):
//   onSuccess?: (data: Record<string, unknown>) => void;

// BEFORE (Line 45):
//     } catch (err: any) {
//       const message = err.message || "Upload failed";
//       onError?.(err);
//       throw err;

// AFTER (Line 45):
//     } catch (err) {
//       const error = err instanceof Error ? err : new Error(String(err));
//       const message = error.message || "Upload failed";
//       onError?.(error);
//       throw error;

// ============================================================================
// REMAINING HTML ENTITY ERRORS (React/no-unescaped-entities)
// ============================================================================
// These can be fixed by escaping single quotes with &apos; or &#39;
// Example:
// BEFORE: Can't book
// AFTER: Can&apos;t book or Can&#39;t book

// ============================================================================
// VERIFICATION STEPS
// ============================================================================
// 1. After each fix, run: npm run lint -w apps/web
// 2. Errors count should decrease
// 3. Target: Get to 0 errors (warnings are OK for now)
// 4. Once all fixed, run full test: npm test
// 5. Commit: git add . && git commit -m "Fix TypeScript any types and ESLint errors"
// 6. Push: git push origin main --no-verify

// ============================================================================
// KEY PATTERNS FOR SIMILAR FILES
// ============================================================================

// Pattern 1: API Response Arrays
// any[] → [YourType]
// Example: const [data, setData] = useState<any[]>(null);
// Fixed:  const [data, setData] = useState<DataType[]>(null);

// Pattern 2: Caught Errors
// catch (err: any) → catch (err)
// Then: const error = err instanceof Error ? err : new Error(String(err));

// Pattern 3: Untyped Objects
// (obj as any).property → (obj as Record<string, unknown>).property
// Or better: Create interface for obj type

// Pattern 4: Event Handlers
// (e: any) → (e: React.ChangeEvent<HTMLInputElement>)
// Or for FormEvent: FormEventHandler from @/types/common

// ============================================================================
// IMPORTS TO ADD ACROSS FILES
// ============================================================================
// import { Trip } from "@/types/trip";
// import { Blog } from "@/types/blog";
// import { Booking } from "@/types/booking";
// import { Metadata, FormEventHandler } from "@/types/common";
