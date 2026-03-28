# Tisra — Architecture Document

> **Last Updated:** 2026-03-28
> **Stack:** TypeScript · Node.js · Express.js · Socket.IO · Prisma · PostgreSQL · Spotify Web API, nodemailer (OTP service)

---

## 1. High-Level Architecture

```
┌─────────────┐      HTTPS / WSS       ┌──────────────────────────────────────────────┐
│   Frontend   │ ◄───────────────────► │              Tisra Backend                    │
│  (Client)    │                        │                                              │
└─────────────┘                        │  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
                                       │  │  Routes   │→│Controllers│→│ Services   │  │
                                       │  └──────────┘  └───────────┘  └─────┬─────┘  │
                                       │                                     │         │
                                       │                           ┌─────────┴───────┐ │
                                       │                           │   Repositories   │ │
                                       │                           └─────────┬───────┘ │
                                       │                                     │         │
                                       │  ┌──────────┐              ┌───────▼───────┐ │
                                       │  │Socket.IO │              │   PostgreSQL   │ │
                                       │  │ Gateway  │              │   (Prisma)     │ │
                                       │  └──────────┘              └───────────────┘ │
                                       │         │                                     │
                                       │  ┌──────▼──────┐   ┌─────────────────────┐   │
                                       │  │  Chat &     │   │   Spotify Web API   │   │
                                       │  │  Room Sync  │   │   (Client Creds)    │   │
                                       │  └─────────────┘   └─────────────────────┘   │
                                       └──────────────────────────────────────────────┘
```

### Request Flow

```
Client Request
  → Route (path + middleware chain)
    → Validator (Joi schema — rejects 422 on failure)
      → Controller (extracts request data, delegates to service)
        → Service (business logic, orchestration)
          → Repository (Prisma database operations)
          → External API (Spotify)
        ← Service returns result
      ← Controller sends HTTP response
```

---

## 2. Folder Structure

```
src/
├── app.ts                          # Express app setup (middlewares, routes, error handler)
├── server.ts                       # HTTP + Socket.IO server bootstrap
│
├── config/
│   ├── index.ts                    # Re-exports all config
│   ├── env.ts                      # Validated environment variables
│   ├── database.ts                 # Prisma client singleton
│   └── spotify.ts                  # Spotify API client & token management
│
├── routes/
│   ├── index.ts                    # Root router — mounts all module routers
│   ├── auth/
│   │   └── index.ts                # Auth routes
│   ├── user/
│   │   └── index.ts                # User profile routes
│   ├── music/
│   │   └── index.ts                # Music / Spotify routes
│   └── room/
│       └── index.ts                # Room management routes
│
├── controllers/
│   ├── index.ts
│   ├── auth/
│   │   └── index.ts                # Auth controllers
│   ├── user/
│   │   └── index.ts                # User controllers
│   ├── music/
│   │   └── index.ts                # Music controllers
│   └── room/
│       └── index.ts                # Room controllers
│
├── services/
│   ├── index.ts
│   ├── auth/
│   │   ├── index.ts                # Auth business logic
│   │   └── helper.ts               # Auth helpers (hashing, token generation)
│   ├── user/
│   │   ├── index.ts                # User business logic
│   │   └── helper.ts               # User helpers
│   ├── music/
│   │   ├── index.ts                # Music / Spotify business logic
│   │   └── helper.ts               # Spotify API helpers
│   ├── room/
│   │   ├── index.ts                # Room business logic
│   │   └── helper.ts               # Room helpers (code generation, etc.)
│   └── chat/
│       ├── index.ts                # Chat business logic
│       └── helper.ts               # Chat helpers
│
├── repositories/
│   ├── user/
│   │   └── index.ts                # User database operations
│   ├── room/
│   │   └── index.ts                # Room database operations
│   ├── room-participant/
│   │   └── index.ts                # Room participant operations
│   ├── chat-message/
│   │   └── index.ts                # Chat message operations
│   ├── playlist/
│   │   └── index.ts                # Playlist operations
│   └── playlist-track/
│       └── index.ts                # Playlist track operations
│
├── validators/
│   ├── index.ts
│   ├── auth/
│   │   └── index.ts                # Auth Joi schemas + validator middlewares
│   ├── user/
│   │   └── index.ts                # User Joi schemas + validator middlewares
│   ├── music/
│   │   └── index.ts                # Music Joi schemas + validator middlewares
│   └── room/
│       └── index.ts                # Room Joi schemas + validator middlewares
│
├── middlewares/
│   ├── auth.ts                     # JWT authentication middleware
│   ├── error-handler.ts            # Centralized error handling middleware
│   ├── rate-limiter.ts             # Rate limiting middleware
│   └── socket-auth.ts              # Socket.IO authentication middleware
│
├── sockets/
│   ├── index.ts                    # Socket.IO initialization & namespace setup
│   ├── room-handler.ts             # Room join/leave/playback socket handlers
│   └── chat-handler.ts             # Chat message socket handlers
│
├── types/
│   ├── index.ts                    # Re-exports all types
│   ├── auth.types.ts               # Auth-related types & interfaces
│   ├── user.types.ts               # User-related types & interfaces
│   ├── music.types.ts              # Music/Spotify-related types & interfaces
│   ├── room.types.ts               # Room-related types & interfaces
│   ├── chat.types.ts               # Chat-related types & interfaces
│   ├── socket.types.ts             # Socket event types & payloads
│   └── common.types.ts             # Shared/common types (ApiResponse, Pagination, etc.)
│
├── errors/
│   ├── app-error.ts                # Base AppError class
│   └── index.ts                    # All custom error classes (NotFound, Conflict, etc.)
│
└── utils/
    ├── logger.ts                   # Structured logger setup
    └── generate-code.ts            # Utility to generate unique room codes
```

---

## 3. Module Pattern

Each feature module follows the same vertical structure:

```
routes/<module>/index.ts        → Defines endpoints + middleware chain
validators/<module>/index.ts    → Joi schemas + validation middleware
controllers/<module>/index.ts   → Request handling + response formatting
services/<module>/index.ts      → Business logic
services/<module>/helper.ts     → Module-specific helper functions
repositories/<module>/index.ts  → Database access via Prisma
types/<module>.types.ts         → Module-specific TypeScript types
```

### Route Registration Pattern

```typescript
// routes/auth/index.ts
import { Router } from "express";
import { registerValidator, loginValidator } from "../../validators/auth";
import { registerController, loginController } from "../../controllers/auth";

const authRouter: Router = Router();

authRouter.post("/register", registerValidator, registerController);
authRouter.post("/login", loginValidator, loginController);

export { authRouter };
```

### Route Mounting

```typescript
// routes/index.ts
import { Router } from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { musicRouter } from "./music";
import { roomRouter } from "./room";
import { authMiddleware } from "../middlewares/auth";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", authMiddleware, userRouter);
rootRouter.use("/music", authMiddleware, musicRouter);
rootRouter.use("/rooms", authMiddleware, roomRouter);

export { rootRouter };
```

---

## 4. Socket.IO Architecture

### Server Bootstrap

```typescript
// server.ts
import http from "http";
import { app } from "./app";
import { initializeSocketIO } from "./sockets";

const server: http.Server = http.createServer(app);
initializeSocketIO(server);

server.listen(PORT, () => {
  /* ... */
});
```

### Event Handling Pattern

```typescript
// sockets/index.ts
import { Server as SocketServer } from "socket.io";
import { socketAuthMiddleware } from "../middlewares/socket-auth";
import { registerRoomHandlers } from "./room-handler";
import { registerChatHandlers } from "./chat-handler";

export const initializeSocketIO = (httpServer: http.Server): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      /* ... */
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    registerRoomHandlers(io, socket);
    registerChatHandlers(io, socket);
  });

  return io;
};
```

### Room Socket Flow

1. User authenticates via HTTP (gets JWT).
2. Client connects to Socket.IO with JWT in `auth` handshake.
3. `socketAuthMiddleware` verifies JWT, attaches user to socket.
4. Client emits `room:join` → server adds socket to room channel.
5. Host emits `playback:action` → server verifies host role → broadcasts `playback:update` to room.
6. Any participant emits `chat:message` → server broadcasts to room.

---

## 5. Authentication Flow

```
Register:  POST /api/auth/register
  → Validate input (Joi)
  → Check if email/username exists
  → Hash password (bcrypt)
  → Create user (Prisma)
  → Generate JWT access + refresh tokens
  → Return tokens

Login:  POST /api/auth/login
  → Validate input (Joi)
  → Find user by email
  → Compare password (bcrypt)
  → Generate JWT access + refresh tokens
  → Return tokens

Protected Route:
  → authMiddleware extracts Bearer token
  → Verify JWT signature + expiry
  → Attach user payload to req.user
  → Proceed to controller
```

---

## 6. Spotify Integration Architecture

```
┌─────────────┐     Client Credentials      ┌─────────────────┐
│  Tisra      │ ──────────────────────────► │  Spotify API     │
│  Backend    │ ◄────────────────────────── │  accounts.spotify│
│             │       Access Token           │                 │
│  config/    │                              └─────────────────┘
│  spotify.ts │     Search / Track / etc     ┌─────────────────┐
│             │ ──────────────────────────► │  Spotify API     │
│             │ ◄────────────────────────── │  api.spotify.com │
└─────────────┘       JSON Response          └─────────────────┘
```

- **Token Management:** `config/spotify.ts` handles token acquisition, caching, and auto-refresh.
- **Service Layer:** `services/music/index.ts` calls Spotify endpoints using the cached token.
- **No user Spotify login required** — all API calls use the app's Client Credentials.

---

## 7. Database Design (Prisma Schema)

### Entity Relationships

```
User 1──────M Room            (hostId)
User 1──────M RoomParticipant (userId)
Room 1──────M RoomParticipant (roomId)
User 1──────M ChatMessage     (senderId)
Room 1──────M ChatMessage     (roomId)
User 1──────M Playlist        (userId)
Playlist 1──M PlaylistTrack   (playlistId)
```

---

## 8. Error Handling Strategy

```
Controller
  try { service call } catch (error) { next(error) }

↓ Error propagates to centralized error handler ↓

middlewares/error-handler.ts
  → If AppError: send { success: false, error: { code, message } }
  → If unknown: log full error, send 500 Internal Server Error
```

---

## 9. Environment Configuration

All environment variables are loaded and validated in `config/env.ts`:

```
NODE_ENV                  # development | staging | production
PORT                      # Server port (default: 3000)
DATABASE_URL              # PostgreSQL connection string
JWT_ACCESS_SECRET         # JWT access token secret
JWT_REFRESH_SECRET        # JWT refresh token secret
JWT_ACCESS_EXPIRY         # e.g., "15m"
JWT_REFRESH_EXPIRY        # e.g., "7d"
SPOTIFY_CLIENT_ID         # Spotify application client ID
SPOTIFY_CLIENT_SECRET     # Spotify application client secret
CORS_ORIGIN               # Allowed frontend origin
```
