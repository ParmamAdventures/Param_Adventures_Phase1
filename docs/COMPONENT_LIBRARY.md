# Component Library - Param Adventures

**Purpose**: Complete reference guide for all reusable UI components and patterns  
**Audience**: Frontend developers, UI designers, contributors  
**Last Updated**: January 18, 2026

---

## 📋 Table of Contents

1. [UI Components](#ui-components)
2. [Composite Components](#composite-components)
3. [Hooks & State Management](#hooks--state-management)
4. [Layout Components](#layout-components)
5. [Patterns & Best Practices](#patterns--best-practices)
6. [Common Usage Examples](#common-usage-examples)

---

## 🎨 UI Components

### Location

`apps/web/src/components/ui/`

### Button

**Purpose**: Interactive action trigger  
**Props**:

- `variant`: "default" | "ghost" | "outline" | "secondary"
- `size`: "sm" | "md" | "lg"
- `disabled`: boolean
- `isLoading`: boolean
- `onClick`: (e: React.MouseEvent) => void

**Examples**:

```tsx
// Basic button
<Button>Click me</Button>

// With variant
<Button variant="ghost">Ghost Button</Button>

// Loading state
<Button isLoading disabled>Processing...</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

---

### Card

**Purpose**: Container for content grouping  
**Props**:

- `className`: string (optional)
- `children`: ReactNode

**Examples**:

```tsx
<Card>
  <div className="p-6">
    <h3 className="font-bold">Card Title</h3>
    <p>Card content goes here</p>
  </div>
</Card>

// With custom styling
<Card className="border-2 border-accent">
  Content
</Card>
```

---

### Input

**Purpose**: Text input field  
**Props**:

- `type`: "text" | "email" | "password" | "number"
- `placeholder`: string
- `value`: string
- `onChange`: (e: React.ChangeEvent<HTMLInputElement>) => void
- `disabled`: boolean
- `className`: string

**Examples**:

```tsx
// Basic input
<Input placeholder="Enter name" />

// Controlled input
<Input
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Full name"
/>

// Email input
<Input type="email" placeholder="your@email.com" />
```

---

### Select

**Purpose**: Dropdown selection  
**Props**:

- `options`: Array<{ value: string; label: string }>
- `value`: string
- `onChange`: (value: string) => void
- `placeholder`: string

**Examples**:

```tsx
// Basic select
<Select
  options={[
    { value: "trek", label: "Trekking" },
    { value: "corporate", label: "Corporate" },
  ]}
  value={selected}
  onChange={setSelected}
/>
```

---

### Modal

**Purpose**: Dialog overlay for focused interactions  
**Props**:

- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `children`: ReactNode
- `footer`: ReactNode (optional)

**Examples**:

```tsx
const { isOpen, open, close } = useModalState();

<Modal isOpen={isOpen} onClose={close} title="Confirm Action">
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-2">
    <Button onClick={close}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>

<Button onClick={open}>Open Modal</Button>
```

---

### Spinner

**Purpose**: Loading indicator  
**Props**:

- `size`: "sm" | "md" | "lg"
- `className`: string

**Examples**:

```tsx
// Basic spinner
<Spinner />

// Different sizes
<Spinner size="sm" />
<Spinner size="lg" />

// In a container
<div className="flex items-center justify-center">
  <Spinner size="md" />
  <span className="ml-2">Loading...</span>
</div>
```

---

### Dialog

**Purpose**: Accessible modal dialog  
**Props**:

- `open`: boolean
- `onOpenChange`: (open: boolean) => void
- `trigger`: ReactNode
- `content`: ReactNode

**Examples**:

```tsx
<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content here</p>
  </DialogContent>
</Dialog>
```

---

### StatusBadge

**Purpose**: Display status indicators  
**Props**:

- `status`: "ACTIVE" | "INACTIVE" | "PENDING" | "COMPLETED" | "CANCELLED"
- `className`: string

**Examples**:

```tsx
<StatusBadge status="ACTIVE" />
<StatusBadge status="PENDING" />
<StatusBadge status="CANCELLED" />
```

---

### StarRating

**Purpose**: Display and collect star ratings  
**Props**:

- `rating`: number (0-5)
- `onChange`: (rating: number) => void (optional)
- `readOnly`: boolean
- `size`: "sm" | "md" | "lg"

**Examples**:

```tsx
// Display only
<StarRating rating={4} readOnly />;

// Interactive
const [rating, setRating] = useState(0);
<StarRating rating={rating} onChange={setRating} />;
```

---

### ScrollReveal

**Purpose**: Animate elements on scroll  
**Props**:

- `children`: ReactNode
- `width`: string | number
- `delay`: number (ms)

**Examples**:

```tsx
<ScrollReveal width="100%">
  <section>Appears on scroll</section>
</ScrollReveal>

<ScrollReveal delay={300}>
  <Card>Delayed animation</Card>
</ScrollReveal>
```

---

### Skeleton

**Purpose**: Loading placeholder  
**Props**:

- `count`: number
- `height`: string | number
- `circle`: boolean
- `className`: string

**Examples**:

```tsx
// Single skeleton
<Skeleton height={20} />

// Multiple skeletons
<Skeleton count={3} height={20} />

// Circular skeleton (for avatars)
<Skeleton circle height={50} width={50} />
```

---

### ErrorBlock

**Purpose**: Display error messages with action  
**Props**:

- `error`: string | Error
- `onRetry`: () => void (optional)
- `title`: string

**Examples**:

```tsx
// Simple error
<ErrorBlock error="Something went wrong" />

// With retry
<ErrorBlock
  error={error}
  title="Failed to load trips"
  onRetry={handleRetry}
/>
```

---

### Toast

**Purpose**: Temporary notifications  
**Usage**: Through `useToast()` hook

**Examples**:

```tsx
const { showToast } = useToast();

// Success toast
showToast("Trip booked successfully!", "success");

// Error toast
showToast("Failed to book trip", "error");

// Info toast
showToast("Booking in progress...", "info");
```

---

## 🧩 Composite Components

### Location

`apps/web/src/components/[feature]/`

### Trips Components

#### TripCard

**Purpose**: Display trip summary  
**Props**:

- `trip`: Trip object
- `onClick`: (trip: Trip) => void (optional)

```tsx
<TripCard trip={tripData} onClick={() => navigate(`/trips/${trip.slug}`)} />
```

#### TripDetail

**Purpose**: Full trip information page  
**Props**:

- `tripSlug`: string
- `onBook`: () => void

```tsx
<TripDetail tripSlug="everest-base-camp" onBook={handleBook} />
```

#### TripFilter

**Purpose**: Filter trips by category, difficulty, price  
**Props**:

- `onFilter`: (filters: TripFilters) => void

```tsx
<TripFilter onFilter={(filters) => searchTrips(filters)} />
```

---

### Booking Components

#### BookingModal

**Purpose**: Book a trip  
**Props**:

- `trip`: Trip
- `isOpen`: boolean
- `onClose`: () => void
- `onSubmit`: (bookingData) => void

```tsx
const { isOpen, open, close } = useModalState();

<BookingModal
  trip={trip}
  isOpen={isOpen}
  onClose={close}
  onSubmit={handleBooking}
/>

<Button onClick={open}>Book Now</Button>
```

#### BookingCard

**Purpose**: Display booking summary  
**Props**:

- `booking`: Booking
- `onCancel`: (id: string) => void

```tsx
<BookingCard booking={bookingData} onCancel={handleCancel} />
```

#### ManualPaymentModal

**Purpose**: Manual payment entry  
**Props**:

- `booking`: Booking
- `isOpen`: boolean
- `onClose`: () => void

```tsx
<ManualPaymentModal
  booking={booking}
  isOpen={paymentModalOpen}
  onClose={closePaymentModal}
/>
```

---

### Blog Components

#### BlogCard

**Purpose**: Display blog post summary  
**Props**:

- `blog`: Blog
- `onClick`: (blog: Blog) => void

```tsx
<BlogCard blog={blogData} onClick={() => navigate(`/blogs/${blog.slug}`)} />
```

#### BlogDetail

**Purpose**: Full blog post with editor content  
**Props**:

- `blogSlug`: string

```tsx
<BlogDetail blogSlug="everest-expedition-diary" />
```

---

### Form Components

#### CustomTripForm

**Purpose**: Submit custom trip request  
**Props**:

- `onSubmit`: (data) => void
- `isLoading`: boolean

```tsx
<CustomTripForm onSubmit={handleCustomTrip} isLoading={isSubmitting} />
```

#### ReviewForm

**Purpose**: Submit trip review  
**Props**:

- `tripId`: string
- `onSubmit`: (review) => void

```tsx
<ReviewForm tripId={trip.id} onSubmit={handleReview} />
```

---

## 🪝 Hooks & State Management

### Location

`apps/web/src/hooks/`

### useAsyncOperation

**Purpose**: Manage async operations (loading, success, error)

```tsx
const { state, execute, reset } = useAsyncOperation<Trip>();

const fetchTrip = async () => {
  const result = await execute(async () => {
    const res = await fetch(`/api/trips/${tripId}`);
    return res.json();
  });
};

// Use state
if (state.loading) return <Spinner />;
if (state.error) return <ErrorBlock error={state.error} />;
return <div>{state.data}</div>;
```

---

### useFormState

**Purpose**: Multi-field form state management

```tsx
const { values, handleChange, setField, reset } = useFormState({
  name: "",
  email: "",
  message: ""
});

// Render inputs
<Input
  name="name"
  value={values.name}
  onChange={handleChange}
/>

// Or manually set field
<Input
  value={values.email}
  onChange={(e) => setField("email", e.target.value)}
/>

// Reset form
<Button onClick={reset}>Clear</Button>
```

---

### useModalState

**Purpose**: Modal open/close state

```tsx
const { isOpen, open, close, toggle } = useModalState();

// Use in component
<Modal isOpen={isOpen} onClose={close}>
  Content
</Modal>

<Button onClick={open}>Open</Button>
<Button onClick={toggle}>Toggle</Button>
```

---

### useRazorpay

**Purpose**: Payment gateway integration

```tsx
const { initiatePayment, verifyPayment } = useRazorpay();

const handlePayment = async () => {
  const { orderId } = await initiatePayment({
    amount: 10000,
    email: "user@example.com",
    notes: { bookingId: "123" },
  });
};
```

---

### useRoles

**Purpose**: Permission checking

```tsx
const { hasRole, hasPermission } = useRoles();

if (hasRole("ADMIN")) {
  return <AdminPanel />;
}

if (!hasPermission("trip:create")) {
  return <PermissionDenied />;
}
```

---

### useTripFilters

**Purpose**: Trip filtering and search

```tsx
const { filters, setFilter, clearFilters, applyFilters } = useTripFilters();

// Update filter
setFilter("category", "TREK");
setFilter("priceRange", [1000, 5000]);

// Get filtered results
const filteredTrips = applyFilters(allTrips);
```

---

## 📐 Layout Components

### Location

`apps/web/src/components/layout/`

### Header

**Purpose**: Navigation header  
**Props**: None (uses auth context)

```tsx
<Header />
```

### Footer

**Purpose**: Site footer with links  
**Props**: None

```tsx
<Footer />
```

### MainLayout

**Purpose**: Main page layout wrapper  
**Props**:

- `children`: ReactNode

```tsx
<MainLayout>
  <YourPageContent />
</MainLayout>
```

### AdminLayout

**Purpose**: Admin panel layout  
**Props**:

- `children`: ReactNode

```tsx
<AdminLayout>
  <AdminContent />
</AdminLayout>
```

---

## 🎭 Patterns & Best Practices

### Form Submission Pattern

```tsx
function TripForm() {
  const { values, handleChange, reset } = useFormState(initialValues);
  const { state, execute } = useAsyncOperation();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await execute(async () => {
      const res = await fetch("/api/trips", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed");

      showToast("Trip created successfully!", "success");
      reset();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="title" value={values.title} onChange={handleChange} />
      <Button disabled={state.loading} isLoading={state.loading}>
        Submit
      </Button>
      {state.error && <ErrorBlock error={state.error} />}
    </form>
  );
}
```

---

### Modal Pattern

```tsx
function ConfirmDialog({ onConfirm }) {
  const { isOpen, open, close } = useModalState();

  const handleConfirm = async () => {
    await onConfirm();
    close();
  };

  return (
    <>
      <Button onClick={open}>Delete</Button>

      <Modal isOpen={isOpen} onClose={close} title="Confirm Delete">
        <p>This action cannot be undone.</p>
        <div className="flex gap-2 mt-4">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}
```

---

### Error Handling Pattern

```tsx
function TripsPage() {
  const { state, execute } = useAsyncOperation<Trip[]>();
  const { showToast } = useToast();

  useEffect(() => {
    execute(async () => {
      try {
        const res = await fetch("/api/trips");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      } catch (error) {
        showToast(error.message, "error");
        throw error;
      }
    });
  }, []);

  return (
    <div>
      {state.loading && <Spinner />}
      {state.error && <ErrorBlock error={state.error} onRetry={() => {}} />}
      {state.data &&
        state.data.map((trip) => <TripCard key={trip.id} trip={trip} />)}
    </div>
  );
}
```

---

## 📚 Common Usage Examples

### Example 1: Trip Listing Page

```tsx
import { useState, useEffect } from "react";
import { TripCard, TripFilter, Spinner, ErrorBlock } from "@/components";
import { useAsyncOperation, useTripFilters } from "@/hooks";

export default function TripsPage() {
  const { filters, setFilter, applyFilters } = useTripFilters();
  const { state: tripsState, execute: fetchTrips } = useAsyncOperation();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetchTrips(async () => {
      const res = await fetch(`/api/trips?category=${filters.category}`);
      const data = await res.json();
      setTrips(data.message);
    });
  }, [filters.category]);

  const filtered = applyFilters(trips);

  return (
    <div className="container mx-auto px-4 py-8">
      <TripFilter onFilter={(f) => setFilter("category", f.category)} />

      {tripsState.loading && <Spinner />}
      {tripsState.error && <ErrorBlock error={tripsState.error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
```

---

### Example 2: Modal with Form

```tsx
import { useState } from "react";
import { Modal, Button, Input, Spinner } from "@/components";
import { useModalState, useFormState, useAsyncOperation } from "@/hooks";
import { useToast } from "@/context";

export default function BookTripButton({ trip }) {
  const { isOpen, open, close } = useModalState();
  const { values, handleChange } = useFormState({ guests: 1, email: "" });
  const { state, execute } = useAsyncOperation();
  const { showToast } = useToast();

  const handleSubmit = async () => {
    await execute(async () => {
      const res = await fetch(`/api/bookings`, {
        method: "POST",
        body: JSON.stringify({ ...values, tripId: trip.id }),
      });

      if (!res.ok) throw new Error("Booking failed");

      showToast("Booking confirmed!", "success");
      close();
    });
  };

  return (
    <>
      <Button onClick={open}>Book Now</Button>

      <Modal isOpen={isOpen} onClose={close} title="Book Trip">
        <Input
          name="email"
          placeholder="Email"
          value={values.email}
          onChange={handleChange}
        />
        <Input
          name="guests"
          type="number"
          placeholder="Number of guests"
          value={values.guests}
          onChange={handleChange}
        />

        <div className="flex gap-2 mt-4">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={state.loading}
            isLoading={state.loading}
          >
            Confirm Booking
          </Button>
        </div>

        {state.error && <ErrorBlock error={state.error} />}
      </Modal>
    </>
  );
}
```

---

### Example 3: Data Table

```tsx
import { useState } from "react";
import { Button, StatusBadge, Spinner } from "@/components";
import { useAsyncOperation } from "@/hooks";

export default function BookingsTable() {
  const { state, execute } = useAsyncOperation();

  useEffect(() => {
    execute(async () => {
      const res = await fetch("/api/bookings");
      return res.json();
    });
  }, []);

  if (state.loading) return <Spinner />;
  if (state.error) return <ErrorBlock error={state.error} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th>Trip</th>
            <th>Date</th>
            <th>Guests</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {state.data?.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.trip.title}</td>
              <td>{new Date(booking.startDate).toLocaleDateString()}</td>
              <td>{booking.guests}</td>
              <td>
                <StatusBadge status={booking.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🚀 Getting Started

1. **Import components** from `@/components` and `@/hooks`
2. **Use TypeScript** for better type safety
3. **Compose components** following the patterns above
4. **Test locally** before deploying
5. **Reference this guide** when building new features

---

## 📖 Additional Resources

- [Component Directory](../apps/web/src/components)
- [Hooks Directory](../apps/web/src/hooks)
- [Frontend Guide](./FRONTEND_GUIDE.md)
- [Coding Standards](./CODING_STANDARDS.md)

---

**Last Updated**: January 18, 2026  
**Maintained By**: Frontend Team  
**Questions?** Check the [Frontend Guide](./FRONTEND_GUIDE.md) or ask in the team chat
