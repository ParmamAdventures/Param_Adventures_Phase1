# Custom Hooks Usage Guide

**Created**: January 17, 2026  
**Framework**: React 18+  
**Location**: `apps/web/src/hooks/`

---

## Overview

This guide documents the reusable custom hooks available in the Param Adventures frontend. These hooks encapsulate common patterns to reduce component boilerplate and improve code reusability.

### Hook Library Status

- **Total Hooks**: 7 (4 existing + 3 new)
- **Barrel Export**: `apps/web/src/hooks/index.ts`

---

## 🆕 New Hooks (OPT-013)

### 1. `useAsyncOperation<T>`

**Purpose**: Manages async operation states (loading, success, error)

**Use Cases**:

- Form submissions
- API calls
- Long-running operations
- Payment processing

**API**:

```typescript
interface AsyncState {
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}

function useAsyncOperation<T = any>() {
  return {
    state: AsyncState;
    execute: (operation: () => Promise<T>) => Promise<T | null>;
    reset: () => void;
  };
}
```

**Before** (Without Hook):

```tsx
const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
  "idle"
);
const [error, setError] = useState<string>();

const handleSubmit = async () => {
  setStatus("loading");
  setError(undefined);
  try {
    const result = await apiCall();
    setStatus("success");
    return result;
  } catch (err) {
    setError(err.message);
    setStatus("error");
  }
};
```

**After** (With Hook):

```tsx
import { useAsyncOperation } from "@/hooks";

const { state, execute } = useAsyncOperation();

const handleSubmit = async () => {
  await execute(async () => {
    const result = await apiCall();
    return result;
  });
};

// In JSX:
// {state.status === "loading" && <Spinner />}
// {state.status === "error" && <Error message={state.error} />}
// {state.status === "success" && <Success />}
```

**Usage Example**:

```tsx
import { useAsyncOperation } from "@/hooks";
import { useToast } from "./ui/ToastProvider";

export function CustomTripForm() {
  const { state, execute, reset } = useAsyncOperation();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await execute(async () => {
      const res = await apiFetch("/inquiries", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit");

      showToast("Success!", "success");
      resetForm();
      return res.json();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button loading={state.status === "loading"}>Submit</Button>
      {state.error && <Error message={state.error} />}
    </form>
  );
}
```

**Real-World Component**:

- ✅ [CustomTripForm.tsx](../apps/web/src/components/home/CustomTripForm.tsx)

---

### 2. `useFormState<T>`

**Purpose**: Manages multi-field form state with built-in handlers

**Use Cases**:

- Forms with multiple input fields
- Dynamic field updates
- Form reset functionality
- Checkbox/radio/text input handling

**API**:

```typescript
function useFormState<T extends Record<string, any>>(initialValues: T) {
  return {
    values: T;
    handleChange: (e: ChangeEvent) => void;
    setField: (field: keyof T, value: any) => void;
    setValues: (values: T) => void;
    reset: () => void;
  };
}
```

**Before** (Without Hook):

```tsx
const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: "",
  message: "",
});

const handleChange = (e) => {
  const { name, value, type } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? e.target.checked : value,
  }));
};

const handleReset = () => {
  setFormData({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
};
```

**After** (With Hook):

```tsx
import { useFormState } from "@/hooks";

const { values, handleChange, reset } = useFormState({
  name: "",
  email: "",
  phone: "",
  message: "",
});

// handleChange works with any input automatically
// reset() restores initial values
```

**Usage Example**:

```tsx
import { useFormState } from "@/hooks";

export function ManualPaymentModal({ booking, onSuccess }) {
  const {
    values: formData,
    setField,
    reset,
  } = useFormState({
    amount: booking?.totalPrice.toString() || "",
    method: "UPI",
    transactionId: "",
    proofUrl: "",
  });

  const handleSubmit = async () => {
    const res = await apiFetch("/payments/manual", {
      method: "POST",
      body: JSON.stringify({
        bookingId: booking.id,
        amount: Number(formData.amount) * 100,
        method: formData.method,
        transactionId: formData.transactionId,
        proofUrl: formData.proofUrl,
      }),
    });

    if (res.ok) {
      reset();
      onSuccess();
    }
  };

  return (
    <form>
      <select
        value={formData.method}
        onChange={(e) => setField("method", e.target.value)}
      >
        <option value="UPI">UPI</option>
        <option value="CASH">Cash</option>
      </select>

      <input
        type="number"
        value={formData.amount}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <button onClick={handleSubmit}>Confirm</button>
    </form>
  );
}
```

**Real-World Components**:

- ✅ [ManualPaymentModal.tsx](../apps/web/src/components/admin/ManualPaymentModal.tsx)
- ✅ [BookingModal.tsx](../apps/web/src/components/bookings/BookingModal.tsx) - Complex form with dynamic fields

---

### 3. `useModalState`

**Purpose**: Simplifies modal open/close state management

**Use Cases**:

- Modal dialogs
- Overlays and popups
- Expandable sections
- Conditional rendering of panels

**API**:

```typescript
function useModalState(initialOpen = false) {
  return {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
}
```

**Before** (Without Hook):

```tsx
const [isOpen, setIsOpen] = useState(false);

const open = () => setIsOpen(true);
const close = () => setIsOpen(false);
const toggle = () => setIsOpen((prev) => !prev);
```

**After** (With Hook):

```tsx
import { useModalState } from "@/hooks";

const { isOpen, open, close, toggle } = useModalState();

// That's it! Much cleaner.
```

**Usage Example**:

```tsx
import { useModalState } from "@/hooks";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/Dialog";

export function PaymentDialog() {
  const { isOpen, open, close } = useModalState();

  return (
    <>
      <button onClick={open}>Open Payment Modal</button>

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={close}>
          <DialogContent>
            <DialogHeader>
              <h2>Payment Details</h2>
            </DialogHeader>

            <div>
              {/* Payment form */}
              <button onClick={close}>Cancel</button>
              <button
                onClick={() => {
                  handlePayment();
                  close();
                }}
              >
                Confirm Payment
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
```

**Refactoring Note**: BookingModal currently receives `isOpen` and `onClose` as props, so it doesn't use `useModalState` internally. However, it's useful for components that manage their own modal state.

---

## 📚 Existing Hooks (Pre-OPT-013)

### 1. `useRazorpay()`

**Purpose**: Integrate Razorpay payment gateway

**Location**: `apps/web/src/hooks/useRazorpay.ts`

**API**:

```typescript
function useRazorpay() {
  return {
    initiatePayment: (bookingId: string, userData: any) => Promise<any>;
    message: string;
  };
}
```

**Usage**:

```tsx
const { initiatePayment } = useRazorpay();

const handlePayment = async () => {
  const result = await initiatePayment(booking.id, {
    name: user.name,
    email: user.email,
  });
};
```

---

### 2. `useRoles()`

**Purpose**: Check user permissions and roles

**Location**: `apps/web/src/hooks/useRoles.ts`

**API**:

```typescript
function useRoles() {
  return {
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
  };
}
```

---

### 3. `useSiteConfig()`

**Purpose**: Access global site configuration

**Location**: `apps/web/src/hooks/useSiteConfig.ts`

---

### 4. `useTripFilters()`

**Purpose**: Manage trip search and filter state

**Location**: `apps/web/src/hooks/useTripFilters.ts`

---

## 🔄 Context Hooks

These are exported from context providers:

```typescript
export { useAuth } from "@/context/AuthContext";
export { useSocket } from "@/context/SocketContext";
export { useTheme } from "@/context/ThemeProvider";
export { useToast } from "@/components/ui/ToastProvider";
```

---

## 📊 Migration Guide

### Step 1: Identify Patterns

Look for these patterns in components:

```typescript
// Pattern 1: Async operations with status
const [status, setStatus] = useState("idle");
const [error, setError] = useState();

// Pattern 2: Multi-field form state
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");

// Pattern 3: Modal state
const [isOpen, setIsOpen] = useState(false);
```

### Step 2: Replace with Hooks

```typescript
// Import at top
import { useAsyncOperation, useFormState, useModalState } from "@/hooks";

// Use in component
const { state, execute } = useAsyncOperation();
const { values, handleChange, reset } = useFormState({ name: "", email: "" });
const { isOpen, open, close } = useModalState();
```

### Step 3: Update JSX

- Replace `status` with `state.status`
- Replace `setField()` with `handleChange()` or `setField()`
- Replace `setIsOpen()` with `open()`, `close()`, `toggle()`

---

## ✅ Refactored Components (Proof of Concept)

| Component                                                                     | Status | Hooks Used                      | LOC Reduction |
| ----------------------------------------------------------------------------- | ------ | ------------------------------- | ------------- |
| [CustomTripForm](../apps/web/src/components/home/CustomTripForm.tsx)          | ✅     | useAsyncOperation, useFormState | ~40 LOC       |
| [ManualPaymentModal](../apps/web/src/components/admin/ManualPaymentModal.tsx) | ✅     | useAsyncOperation, useFormState | ~35 LOC       |
| [BookingModal](../apps/web/src/components/bookings/BookingModal.tsx)          | ✅     | useAsyncOperation, useFormState | ~50 LOC       |

---

## 🎯 Future Refactoring Candidates

These components have similar patterns and could benefit from these hooks:

**useAsyncOperation**:

- `TripForm.tsx` - Complex form with async submission
- `BlogEditor.tsx` - Blog creation/editing with upload
- `Newsletter.tsx` - Newsletter subscription (already has pattern)

**useFormState**:

- `TripFilters.tsx` - Complex filter management
- Other admin modals and forms

**useModalState**:

- `AssignManagerModal.tsx`
- `AssignGuideModal.tsx`
- `CancelBookingDialog.tsx`

---

## 💡 Best Practices

1. **Use hooks over raw useState for patterns**
   - Reduces boilerplate
   - Ensures consistency
   - Easier to test

2. **Combine hooks when needed**

   ```tsx
   // Both for async forms
   const { state, execute } = useAsyncOperation();
   const { values, handleChange, reset } = useFormState({...});
   ```

3. **Keep component logic in component**
   - Hooks manage state
   - Components manage UI/logic

4. **Always provide initial values to useFormState**

   ```tsx
   // Good
   const { values } = useFormState({ name: "", email: "" });

   // Avoid (undefined initial state)
   const { values } = useFormState({});
   ```

---

## 📝 Git Commits

- **d4657ba**: feat(opt-013): create 3 reusable custom hooks for common patterns
- **f20e186**: chore(opt-013): update MASTER_TODO_LIST with custom hooks completion

---

## 🔗 Related Documentation

- [MASTER_TODO_LIST.md](../MASTER_TODO_LIST.md) - OPT-013 section for implementation details
- [React Hooks API Reference](https://react.dev/reference/react) - Official React documentation

---

**Next Steps**:

- Refactor remaining components in future optimization sessions
- Consider creating specialized hooks for common business logic (e.g., `useBookingFlow`, `usePaymentFlow`)
- Monitor hook adoption and gather feedback for improvements
