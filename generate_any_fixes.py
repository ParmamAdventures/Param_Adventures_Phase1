#!/usr/bin/env python3
"""
Generate exact line-by-line replacements for 'any' type errors in web app
"""

import os

fixes = [
    # dashboard/bookings/page.tsx
    {
        "file": "apps/web/src/app/dashboard/bookings/page.tsx",
        "line": 18,
        "before": "  const [bookings, setBookings] = useState<any[]>([]);",
        "after": "  const [bookings, setBookings] = useState<Booking[]>([]);",
    },
    {
        "file": "apps/web/src/app/dashboard/bookings/page.tsx",
        "line": 23,
        "before": "  const [selectedBooking, setSelectedBooking] = useState<any>(null);",
        "after": "  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);",
    },
    {
        "file": "apps/web/src/app/dashboard/bookings/page.tsx",
        "line": 26,
        "before": "  const [invoiceBooking, setInvoiceBooking] = useState<any>(null);",
        "after": "  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);",
    },
    {
        "file": "apps/web/src/app/dashboard/bookings/page.tsx",
        "line": 29,
        "before": "  const [reviewBooking, setReviewBooking] = useState<any>(null);",
        "after": "  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);",
    },
    {
        "file": "apps/web/src/app/dashboard/bookings/page.tsx",
        "line": 50,
        "before": "  const openCancelModal = (booking: any) => {",
        "after": "  const openCancelModal = (booking: Booking) => {",
    },
    {
        "file": "apps/web/src/app/dashboard/bookings/page.tsx",
        "line": 55,
        "before": "  const openInvoiceModal = (booking: any) => {",
        "after": "  const openInvoiceModal = (booking: Booking) => {",
    },
    {
        "file": "apps/web/src/app/dashboard/bookings/page.tsx",
        "line": 60,
        "before": "  const openReviewModal = (booking: any) => {",
        "after": "  const openReviewModal = (booking: Booking) => {",
    },
    
    # dashboard/blogs/[id]/edit/page.tsx
    {
        "file": "apps/web/src/app/dashboard/blogs/[id]/edit/page.tsx",
        "line": 17,
        "before": "  const [coverImage, setCoverImage] = useState<any>(null);",
        "after": "  const [coverImage, setCoverImage] = useState<{ url: string; id: string } | null>(null);",
    },
    {
        "file": "apps/web/src/app/dashboard/blogs/[id]/edit/page.tsx",
        "line": 18,
        "before": "  const [content, setContent] = useState<any>(null);",
        "after": "  const [content, setContent] = useState<Record<string, any> | null>(null);",
    },
    
    # dashboard/blogs/new/page.tsx
    {
        "file": "apps/web/src/app/dashboard/blogs/new/page.tsx",
        "line": 16,
        "before": "  const [coverImage, setCoverImage] = useState<any>(null);",
        "after": "  const [coverImage, setCoverImage] = useState<{ url: string; id: string } | null>(null);",
    },
    {
        "file": "apps/web/src/app/dashboard/blogs/new/page.tsx",
        "line": 17,
        "before": "  const [content, setContent] = useState<any>(null);",
        "after": "  const [content, setContent] = useState<Record<string, any> | null>(null);",
    },
    {
        "file": "apps/web/src/app/dashboard/blogs/new/page.tsx",
        "line": 23,
        "before": "  const [tripDetails, setTripDetails] = useState<any>(null);",
        "after": "  const [tripDetails, setTripDetails] = useState<Trip | null>(null);",
    },
    {
        "file": "apps/web/src/app/dashboard/blogs/new/page.tsx",
        "line": 25,
        "before": "  const BLOG_TEMPLATES: Record<string, any> = {",
        "after": "  const BLOG_TEMPLATES: Record<string, Record<string, any>> = {",
    },
    
    # dashboard/guide/page.tsx
    {
        "file": "apps/web/src/app/dashboard/guide/page.tsx",
        "line": 20,
        "before": "  const [assignments, setAssignments] = useState<any[] | null>(null);",
        "after": "  const [assignments, setAssignments] = useState<Trip[] | null>(null);",
    },
    {
        "file": "apps/web/src/app/dashboard/guide/page.tsx",
        "line": 33,
        "before": "      } catch (err: any) {",
        "after": "      } catch (err) {",
    },
    {
        "file": "apps/web/src/app/dashboard/guide/page.tsx",
        "line": 79,
        "before": "          {assignments.map((trip: any) => (",
        "after": "          {assignments.map((trip: Trip) => (",
    },
    {
        "file": "apps/web/src/app/dashboard/guide/page.tsx",
        "line": 135,
        "before": "                    {trip.bookings?.map((booking: any) => (",
        "after": "                    {trip.bookings?.map((booking: Booking) => (",
    },
    
    # dashboard/manager/page.tsx
    {
        "file": "apps/web/src/app/dashboard/manager/page.tsx",
        "line": 12,
        "before": "  const [trips, setTrips] = useState<any[]>([]);",
        "after": "  const [trips, setTrips] = useState<Trip[]>([]);",
    },
    
    # dashboard/page.tsx
    {
        "file": "apps/web/src/app/dashboard/page.tsx",
        "line": 13,
        "before": "  const [blogs, setBlogs] = useState<any[]>([]);",
        "after": "  const [blogs, setBlogs] = useState<Blog[]>([]);",
    },
    
    # dashboard/profile/page.tsx
    {
        "file": "apps/web/src/app/dashboard/profile/page.tsx",
        "line": 35,
        "before": "  const [preferences, setPreferences] = useState<any>({});",
        "after": "  const [preferences, setPreferences] = useState<Record<string, any>>({});",
    },
    
    # dashboard/wishlist/page.tsx
    {
        "file": "apps/web/src/app/dashboard/wishlist/page.tsx",
        "line": 82,
        "before": "              trip={trip as any}",
        "after": "              trip={trip}",
    },
    
    # page.tsx (home page)
    {
        "file": "apps/web/src/app/page.tsx",
        "line": 114,
        "before": "        const categoryTrips = allTrips.filter(\n          (t: any) =>",
        "after": "        const categoryTrips = allTrips.filter(\n          (t: Trip) =>",
    },
    {
        "file": "apps/web/src/app/page.tsx",
        "line": 190,
        "before": "                {blogs.map((blog: any) => (",
        "after": "                {blogs.map((blog: Blog) => (",
    },
    
    # trips/[slug]/page.tsx
    {
        "file": "apps/web/src/app/trips/[slug]/page.tsx",
        "line": 36,
        "before": "      image: (trip as any).coverImage?.mediumUrl || \"/og-image.jpg\",",
        "after": "      image: trip.coverImage?.mediumUrl || \"/og-image.jpg\",",
    },
    {
        "file": "apps/web/src/app/trips/[slug]/page.tsx",
        "line": 179,
        "before": "                  {trip.gallery.map((item: any, i: number) => (",
        "after": "                  {trip.gallery.map((item: GalleryItem, i: number) => (",
    },
    
    # login/__tests__/page.test.tsx
    {
        "file": "apps/web/src/app/login/__tests__/page.test.tsx",
        "line": 32,
        "before": "  default: (props: any) => <img {...props} alt={props.alt} />,",
        "after": "  default: (props: ImageProps) => <img {...props} alt={props.alt} />,",
    },
    
    # my-bookings/page.tsx
    {
        "file": "apps/web/src/app/my-bookings/page.tsx",
        "line": 15,
        "before": "  const [bookings, setBookings] = useState<any[] | null>(null);",
        "after": "  const [bookings, setBookings] = useState<Booking[] | null>(null);",
    },
]

def main():
    print("=" * 80)
    print("EXACT LINE-BY-LINE 'ANY' TYPE FIXES FOR WEB APP")
    print("=" * 80)
    print()
    
    for i, fix in enumerate(fixes, 1):
        print(f"{fix['file']}:{fix['line']}")
        print(f"Before: {fix['before']}")
        print(f"After:  {fix['after']}")
        print()
    
    print("=" * 80)
    print(f"Total fixes: {len(fixes)}")
    print("=" * 80)

if __name__ == "__main__":
    main()
