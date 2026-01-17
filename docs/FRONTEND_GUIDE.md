# Frontend Development Guide - Param Adventures

Comprehensive guide for frontend development patterns and best practices.

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Getting Started](#getting-started)
3. [Component Patterns](#component-patterns)
4. [Hooks & State](#hooks--state)
5. [Styling](#styling)
6. [API Integration](#api-integration)
7. [Performance](#performance)
8. [Testing](#testing)
9. [Common Tasks](#common-tasks)

---

## 📁 Project Structure

```
apps/web/
├── public/              # Static assets
│   ├── images/
│   └── favicons/
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/     # Auth route group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── trips/
│   │   │   ├── [slug]/
│   │   │   └── layout.tsx
│   │   ├── admin/      # Protected admin routes
│   │   └── api/        # Route handlers
│   ├── components/     # Reusable React components
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx
│   │   │   └── AdminLayout.tsx
│   │   ├── common/     # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Button.tsx
│   │   ├── trips/      # Trip-specific components
│   │   │   ├── TripCard.tsx
│   │   │   ├── TripDetail.tsx
│   │   │   └── TripFilter.tsx
│   │   └── booking/    # Booking components
│   │       ├── BookingForm.tsx
│   │       └── PaymentModal.tsx
│   ├── lib/            # Utilities & helpers
│   │   ├── api.ts      # API client
│   │   ├── auth.ts     # Auth utilities
│   │   ├── format.ts   # Data formatting
│   │   └── fetch.ts    # Fetch wrapper
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTrips.ts
│   │   └── useBooking.ts
│   ├── types/          # TypeScript types
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── auth.ts
│   ├── context/        # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── styles/         # Global styles
│   │   └── globals.css
│   └── middleware.ts   # Next.js middleware
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
└── playwright.config.ts
```

---

## 🚀 Getting Started

### Setup

```bash
cd apps/web
npm install
cp .env.example .env.local

# Add to .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Run Development

```bash
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run start
```

---

## 🧩 Component Patterns

### Server Components (Default)

```typescript
// app/trips/page.tsx
// This is a Server Component by default
import { getTrips } from '@/lib/api';

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <div>
      {trips.map(trip => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
```

### Client Components

```typescript
// components/trips/TripFilter.tsx
'use client';  // Mark as client component

import { useState } from 'react';

export default function TripFilter({ onFilter }: { onFilter: (filter: any) => void }) {
  const [category, setCategory] = useState('all');

  const handleChange = (value: string) => {
    setCategory(value);
    onFilter({ category: value });
  };

  return (
    <select value={category} onChange={(e) => handleChange(e.target.value)}>
      <option value="all">All Trips</option>
      <option value="adventure">Adventure</option>
      <option value="relaxation">Relaxation</option>
    </select>
  );
}
```

### Reusable Components

```typescript
// components/common/Button.tsx
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} disabled:opacity-50`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? '...' : children}
    </button>
  );
}
```

---

## 🪝 Hooks & State

### Custom Hooks

```typescript
// hooks/useAuth.ts
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

// Usage
'use client';
export default function Profile() {
  const { user, logout } = useAuth();
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Data Fetching Hook

```typescript
// hooks/useTrips.ts
import { useState, useEffect } from 'react';
import { getTrips } from '@/lib/api';

export function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getTrips();
        setTrips(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trips');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { trips, loading, error };
}
```

### Form State Hook

```typescript
// hooks/useForm.ts
import { useState } from 'react';

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      const err = error as any;
      setErrors(err.errors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, errors, isSubmitting, handleChange, handleSubmit };
}

// Usage
const { values, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  async (values) => {
    await loginUser(values);
  }
);
```

---

## 🎨 Styling

### Tailwind CSS

```typescript
// components/trips/TripCard.tsx
export default function TripCard({ trip }: { trip: Trip }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <img
        src={trip.image}
        alt={trip.title}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h2 className="text-xl font-bold text-gray-900 mb-2">{trip.title}</h2>
      <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-blue-600 font-semibold">₹{trip.price}</span>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          View Details
        </button>
      </div>
    </div>
  );
}
```

### CSS Modules (for isolated styles)

```css
/* components/layout/Header.module.css */
.header {
  background-color: var(--color-primary);
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  align-items: center;
}
```

```typescript
// components/layout/Header.tsx
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Navigation */}
      </nav>
    </header>
  );
}
```

---

## 🔌 API Integration

### API Client

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  getTrips: () => fetchAPI<Trip[]>('/trips'),
  getTrip: (slug: string) => fetchAPI<Trip>(`/trips/${slug}`),
  createBooking: (data: BookingInput) => 
    fetchAPI<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (data: UserInput) =>
    fetchAPI<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
```

### Server-Side Data Fetching

```typescript
// app/trips/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getTrip } from '@/lib/api';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const trip = await getTrip(params.slug);
  
  return {
    title: trip.title,
    description: trip.description,
    openGraph: {
      title: trip.title,
      description: trip.description,
      images: [trip.image],
    },
  };
}

export default async function TripDetailPage({ params }: { params: { slug: string } }) {
  try {
    const trip = await getTrip(params.slug);
    return <TripDetailView trip={trip} />;
  } catch (error) {
    notFound();
  }
}
```

---

## ⚡ Performance

### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Good
<Image
  src={trip.image}
  alt={trip.title}
  width={400}
  height={300}
  priority  // Above the fold
  quality={75}  // Reduce file size
/>

// ❌ Bad
<img src={trip.image} alt={trip.title} />
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Heavy component loaded only when needed
const PaymentForm = dynamic(() => import('@/components/booking/PaymentForm'), {
  loading: () => <div>Loading payment...</div>,
});

export default function BookingPage() {
  return (
    <>
      <BookingDetails />
      <PaymentForm />  {/* Lazy loaded */}
    </>
  );
}
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive component
const TripCard = memo(function TripCard({ trip }: { trip: Trip }) {
  return <div>{trip.title}</div>;
});

// Memoize computed values
function TripList({ trips }: { trips: Trip[] }) {
  const sortedTrips = useMemo(
    () => trips.sort((a, b) => a.price - b.price),
    [trips]
  );

  // Memoize callbacks
  const handleSelect = useCallback((trip: Trip) => {
    console.log('Selected:', trip);
  }, []);

  return (
    <div>
      {sortedTrips.map(trip => (
        <TripCard
          key={trip.id}
          trip={trip}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

---

## 🧪 Testing

### Component Testing

```typescript
// components/common/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('returns user data', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('logs out user', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
```

---

## 🛠️ Common Tasks

### Add New Page

```typescript
// 1. Create file: app/blogs/page.tsx
export default function BlogsPage() {
  return <div>Blogs page</div>;
}

// 2. Add route to navigation in components/common/Navigation.tsx
// 3. Update types if needed in types/models.ts
```

### Create Protected Route

```typescript
// 1. Create middleware: middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/bookings/:path*'],
};

// 2. Routes under /admin will require token
```

### Add Form with Validation

```typescript
// 1. Create component with validation
'use client';
import { useForm } from '@/hooks/useForm';
import { bookTrip } from '@/lib/api';

export default function BookingForm({ tripId }: { tripId: string }) {
  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm(
    { email: '', phone: '', date: '' },
    async (values) => {
      await bookTrip({ ...values, tripId });
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
      />
      {errors.email && <span className="text-red-600">{errors.email}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Booking...' : 'Book Trip'}
      </button>
    </form>
  );
}
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: January 17, 2026  
**Version**: 1.0.0
