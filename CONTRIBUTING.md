# Contributing to Param Adventures

Thank you for contributing! This guide outlines our development workflow, code standards, and review process.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Testing](#testing)
5. [Pull Request Process](#pull-request-process)
6. [Code Review Checklist](#code-review-checklist)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- Docker & Docker Compose ([install](https://www.docker.com))
- Git ([install](https://git-scm.com))

### Local Setup

```bash
# 1. Clone repository
git clone https://github.com/ParmamAdventures/Param_Adventures_Phase1.git
cd Param_Adventures_Phase1

# 2. Install dependencies
npm install

# 3. Start infrastructure
docker-compose up -d

# 4. Setup environment
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local

# 5. Initialize database
cd apps/api && npx prisma migrate deploy && npm run seed

# 6. Start development servers
npm run dev
```

See [README.md](README.md) for detailed setup instructions.

---

## 🌳 Development Workflow

### 1. Create Feature Branch

Use descriptive branch names following the convention:

```bash
# New feature
git checkout -b feat/user-authentication

# Bug fix
git checkout -b fix/login-validation

# Documentation
git checkout -b docs/api-guide

# Refactor
git checkout -b refactor/payment-service

# Chore/dependencies
git checkout -b chore/update-dependencies
```

### 2. Make Changes

Follow our [Code Standards](#code-standards) section.

### 3. Run Tests & Linting

```bash
# Test entire project
npm test

# Test specific file
npm test -- auth.test.ts

# Lint code
npm run lint

# Format code
npm run format
```

### 4. Commit Changes

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>: <description>
git commit -m "feat: add user profile page"
git commit -m "fix: resolve payment signature verification"
git commit -m "docs: update payment integration guide"
```

**Common types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Adding/updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Dependencies, build scripts
- `style`: Code style (formatting, semicolons)

### 5. Push & Create Pull Request

```bash
# Push branch
git push origin feat/your-feature

# Go to GitHub and open PR
# Link related issues: "Closes #123"
```

---

## 🧹 Code Standards

### Backend (TypeScript/Express)

**Project Structure**:
```
apps/api/src/
├── controllers/      # Request handlers
├── services/         # Business logic
├── routes/           # API endpoints
├── middlewares/      # Auth, validation, errors
├── schemas/          # Zod validation schemas
├── types/            # TypeScript interfaces
├── lib/              # Utilities (auth, queue, cache)
└── app.ts            # Express setup
```

**Controller Pattern**:
```typescript
export async function createTrip(req: Request, res: Response) {
  try {
    // ✅ Validate input
    const data = createTripSchema.parse(req.body);

    // ✅ Check permissions
    if (!req.user) throw new UnauthorizedError("Not authenticated");

    // ✅ Call service
    const trip = await TripService.create(data, req.user.id);

    // ✅ Return consistent response
    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    // ✅ Let error middleware handle
    throw error;
  }
}
```

**Service Pattern**:
```typescript
export class TripService {
  static async create(data: TripCreateInput, userId: string) {
    // ✅ Validate business rules
    if (!data.price || data.price <= 0) {
      throw new ValidationError("Price must be positive");
    }

    // ✅ Database operation
    const trip = await prisma.trip.create({
      data: { ...data, createdById: userId },
      include: { media: true }
    });

    // ✅ Queue async jobs
    await emailQueue.add("trip-created", { tripId: trip.id });

    return trip;
  }

  static async getById(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { guides: true, reviews: true }
    });

    if (!trip) throw new NotFoundError("Trip not found");
    return trip;
  }
}
```

**Validation Schema**:
```typescript
import { z } from "zod";

export const createTripSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(10, "Description too short"),
  price: z.number().int().positive("Price must be positive"),
  durationDays: z.number().int().min(1),
  difficulty: z.enum(["EASY", "MODERATE", "DIFFICULT", "EXTREME"]),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
```

**Error Handling**:
```typescript
// ✅ GOOD: Throw specific errors
throw new ValidationError("Invalid email");
throw new UnauthorizedError("Not authenticated");
throw new ForbiddenError("Permission denied");
throw new NotFoundError("Resource not found");

// ❌ BAD: Generic errors
throw new Error("Something went wrong");
```

**Database Queries**:
```typescript
// ✅ GOOD: Include related data
const booking = await prisma.booking.findUnique({
  where: { id },
  include: { payment: true, guestDetails: true, trip: true }
});

// ✅ GOOD: Use pagination
const bookings = await prisma.booking.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" }
});

// ❌ BAD: N+1 queries
for (const trip of trips) {
  trip.reviews = await prisma.review.findMany({ where: { tripId: trip.id } });
}
```

### Frontend (TypeScript/React)

**Component Pattern**:
```typescript
import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";

interface UserProfileProps {
  userId: string;
}

export const UserProfile: FC<UserProfileProps> = ({ userId }) => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-600">{user.email}</p>
    </div>
  );
};
```

**Custom Hook Pattern**:
```typescript
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export function useTrips(filters?: TripFilters) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["trips", page, filters],
    queryFn: () => fetchTrips({ page, ...filters }),
  });

  return { trips: data?.trips, total: data?.total, isLoading, error, page, setPage };
}
```

**Styling**:
```typescript
// ✅ GOOD: Use Tailwind classes
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Book Now
</button>

// ✅ GOOD: Extract repeated classes
const buttonClass = "px-4 py-2 rounded font-medium";
<button className={`${buttonClass} bg-blue-600`}>Primary</button>

// ❌ BAD: Inline styles
<button style={{ backgroundColor: "blue", padding: "10px" }}>Click</button>
```

---

## 🧪 Testing

### Backend Tests

**Test Structure**:
```typescript
describe("TripService", () => {
  // ✅ Setup/teardown
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Clear test names
  describe("getById", () => {
    it("should return trip when id is valid", async () => {
      // Arrange: Setup test data
      const mockTrip = { id: "1", title: "Trek" };
      jest.spyOn(prisma.trip, "findUnique").mockResolvedValue(mockTrip);

      // Act: Execute function
      const result = await TripService.getById("1");

      // Assert: Verify results
      expect(result).toEqual(mockTrip);
    });

    it("should throw NotFoundError when trip doesn't exist", async () => {
      jest.spyOn(prisma.trip, "findUnique").mockResolvedValue(null);

      await expect(TripService.getById("invalid")).rejects.toThrow(NotFoundError);
    });
  });
});
```

**Run Tests**:
```bash
cd apps/api

# All tests
npm test

# Specific file
npm test -- trips.test.ts

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

**Test Guidelines**:
- ✅ One concept per test
- ✅ Clear test names
- ✅ Mock external dependencies
- ✅ Test both success and error cases
- ✅ Aim for >80% coverage

See [TESTING_DEVELOPER_GUIDE.md](docs/TESTING_DEVELOPER_GUIDE.md) for detailed examples.

---

## 📮 Pull Request Process

### Before Creating PR

1. **Update your branch** with latest changes:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run full test suite**:
   ```bash
   npm test
   npm run lint
   npm run format
   ```

3. **Update documentation** if needed:
   - Update API docs if adding endpoints
   - Update README if changing setup
   - Add JSDoc comments to new functions

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### After PR Creation

1. **Link related issues**: "Closes #123"
2. **Request reviewers**: Tag team members
3. **Address feedback**: Respond to comments, make changes
4. **Re-request review**: After making changes
5. **Merge**: Once approved

---

## 👀 Code Review Checklist

**Reviewers should verify**:

- [ ] **Code Quality**
  - [ ] Follows project style guidelines
  - [ ] No console.log or debug code
  - [ ] Proper error handling
  - [ ] No security vulnerabilities
  - [ ] Performance acceptable

- [ ] **Functionality**
  - [ ] Solves the issue/implements feature
  - [ ] No regressions
  - [ ] Edge cases handled
  - [ ] Works as documented

- [ ] **Testing**
  - [ ] Tests cover happy path
  - [ ] Tests cover error cases
  - [ ] Tests pass locally
  - [ ] Coverage adequate

- [ ] **Documentation**
  - [ ] Code comments present
  - [ ] API docs updated
  - [ ] README updated if needed
  - [ ] No broken links

- [ ] **Database** (if applicable)
  - [ ] Schema changes in migration
  - [ ] Migration is idempotent
  - [ ] Indexes added if needed
  - [ ] Data migration handles existing data

---

## 📚 Resources

- [README.md](README.md) - Project overview
- [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) - Developer cheat sheet
- [API_GUIDE.md](docs/API_GUIDE.md) - API reference
- [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) - Database design
- [TESTING_DEVELOPER_GUIDE.md](docs/TESTING_DEVELOPER_GUIDE.md) - Testing guide
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production setup

---

## ❓ Questions?

- Check [GitHub Discussions](https://github.com/ParmamAdventures/Param_Adventures_Phase1/discussions)
- Review existing [GitHub Issues](https://github.com/ParmamAdventures/Param_Adventures_Phase1/issues)
- See [docs/](docs/) directory for more info

---

## 🙏 Thank You

We appreciate your contributions to Param Adventures! 🎉

Happy coding! 🚀

## 4. Testing ✅
- **Unit Tests**: Required for new Backend Services/Controllers.
- **E2E**: Critical user flows must be verified in `apps/e2e`.

## 5. Pull Requests (PR) 🔀
1. Push your branch.
2. Create PR to `main` (or active feature branch).
3. Ensure CI checks pass (Lint + Test).
4. Request review from a team member.

## 6. Issue Reporting 🐛
- Use the **Bug Report** template for defects.
- Use the **Feature Request** template for new ideas.
- All PRs must follow the **Pull Request Template** to ensure quality checks.

## 7. Development Tools 🛠️
- **Vercel Preview**: Every branch push generates a unique Preview URL. Use this to verify your changes in a live environment before merging.
