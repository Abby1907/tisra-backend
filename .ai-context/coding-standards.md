# Tisra — Coding Standards

> **Applies to:** All TypeScript source code under `src/`
> **Last Updated:** 2026-03-28

---

## 1. TypeScript Strictness

### 1.1 No `any` Type — Ever

- **NEVER** use `any` as a type annotation, return type, generic argument, or type cast.
- Use `unknown` when the type is truly indeterminate, then narrow with type guards.
- Define explicit interfaces/types for all data structures including API responses, request bodies, and database results.

```typescript
// ❌ WRONG
function parse(data: any): any { ... }

// ✅ CORRECT
function parse(data: unknown): ParsedResult { ... }
```

### 1.2 Strict TypeScript Config

Enable all strict flags in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 1.3 Explicit Return Types

All functions and methods **must** have explicit return type annotations.

```typescript
// ❌ WRONG
function getUser(id: string) { ... }

// ✅ CORRECT
function getUser(id: string): Promise<User> { ... }
```

---

## 2. Code Complexity

### 2.1 Maximum Cyclomatic Complexity: 10

- No single function may have a cyclomatic complexity above **10**.
- Use early returns, guard clauses, and helper functions to reduce complexity.
- Extract complex conditionals into named boolean variables or helper functions.

```typescript
// ❌ WRONG — deep nesting, high complexity
function processRequest(req: Request): Response {
  if (req.user) {
    if (req.user.isActive) {
      if (req.body.type === 'A') {
        // ...
      } else if (req.body.type === 'B') {
        // ...
      }
    }
  }
}

// ✅ CORRECT — early returns, flat structure
function processRequest(req: Request): Response {
  if (!req.user) return unauthorized();
  if (!req.user.isActive) return forbidden();

  return handleByType(req.body.type, req);
}
```

### 2.2 Function Length

- Functions should not exceed **40 lines** of logic (excluding blank lines and comments).
- If a function grows beyond this, extract meaningful helper functions.

---

## 3. Layered Architecture Responsibilities

Each layer has a **single responsibility**. Never mix concerns across layers.

### 3.1 Routes (`routes/`)

- **Only** define route paths, HTTP methods, and middleware chains.
- No business logic, no database calls, no data transformation.
- Pattern: `router.method(path, ...middlewares, validator, controller)`

```typescript
// ✅ CORRECT — routes/auth/index.ts
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { registerValidator } from '../../validators/auth';
import { registerController } from '../../controllers/auth';

const authRouter: Router = Router();
authRouter.post('/register', registerValidator, registerController);

export { authRouter };
```

### 3.2 Controllers (`controllers/`)

- **Only** accept the request and send the response.
- Extract request data (params, body, query) and pass to the service layer.
- Handle HTTP status codes and response formatting.
- **No** business logic. **No** direct database calls.

```typescript
// ✅ CORRECT — controllers/auth/index.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth';

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

### 3.3 Services (`services/`)

- Contain **all business logic**.
- Orchestrate calls to repositories, external APIs (Spotify), and other services.
- Perform data transformation, validation logic, and authorization checks.
- Must not access `req` or `res` objects directly.

```typescript
// ✅ CORRECT — services/auth/index.ts
import { UserRepository } from '../../repositories/user';
import { hashPassword } from './helper';

export class AuthService {
  static async register(data: RegisterInput): Promise<RegisterOutput> {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) throw new ConflictError('Email already registered');

    const hashedPassword = await hashPassword(data.password);
    return UserRepository.create({ ...data, password: hashedPassword });
  }
}
```

### 3.4 Repositories (`repositories/`)

- **Only** perform database operations via Prisma.
- No business logic, no HTTP concerns, no external API calls.
- Each repository maps to a single database entity.

```typescript
// ✅ CORRECT — repositories/user/index.ts
import { prisma } from '../../config/database';
import { User } from '@prisma/client';

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({ data });
  }
}
```

### 3.5 Validators (`validators/`)

- Define Joi validation schemas.
- Export middleware functions that validate `req.body`, `req.params`, or `req.query`.
- Return **422 Unprocessable Entity** on validation failure with clear error messages.

```typescript
// ✅ CORRECT — validators/auth/index.ts
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const registerSchema: Joi.ObjectSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).max(128).required(),
});

export const registerValidator = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(422).json({
      success: false,
      errors: error.details.map((d) => d.message),
    });
    return;
  }
  next();
};
```

### 3.6 Middlewares (`middlewares/`)

- Cross-cutting concerns: authentication, authorization, error handling, rate limiting, logging.
- Must be generic and reusable across modules.

### 3.7 Config (`config/`)

- Centralized configuration: database client, environment variables, Spotify credentials, JWT secrets.
- Export typed configuration objects — never use raw `process.env` outside this folder.

---

## 4. Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | `kebab-case.ts` | `auth-helper.ts` |
| Module index | `index.ts` | `services/auth/index.ts` |
| Interfaces | `PascalCase` with `I` prefix (optional) | `User`, `IAuthService` |
| Types | `PascalCase` | `RegisterInput` |
| Variables & Functions | `camelCase` | `getUserById` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_ROOM_PARTICIPANTS` |
| Classes | `PascalCase` | `AuthService` |
| Enums | `PascalCase` (members: `PascalCase`) | `RoomStatus.Active` |

---

## 5. Error Handling

- Use custom error classes that extend a base `AppError` class.
- Each error class specifies an HTTP status code and error code.
- Never throw raw strings or generic `Error` objects.
- Use a centralized error-handling middleware as the last Express middleware.

```typescript
// ✅ CORRECT
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly errorCode: string
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}
```

---

## 6. Import Order

Maintain consistent import ordering (top to bottom):

1. Node.js built-in modules (`path`, `crypto`)
2. Third-party packages (`express`, `joi`, `jsonwebtoken`)
3. Internal config/utils
4. Internal modules (services, repositories, etc.)
5. Types/interfaces

Separate each group with a blank line.

---

## 7. Environment Variables

- All env vars must be defined in `.env.example` with placeholder values.
- Access env vars **only** through `src/config/env.ts` which validates and exports typed values.
- Never use `process.env.X` directly outside the config module.

---

## 8. Git & Commit Standards

- Follow **Conventional Commits**: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Examples: `feat(auth): add JWT refresh token endpoint`, `fix(room): prevent non-host playback control`

---

## 9. Testing

- Use **Jest** as the test runner.
- Unit tests go in `__tests__/` folders adjacent to source files or in a root `tests/` directory.
- Mock external dependencies (Prisma, Spotify API) in tests.
- Service and repository layers must have ≥ 80% code coverage.
