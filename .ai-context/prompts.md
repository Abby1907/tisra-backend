# Tisra — AI Prompts

> **Designation: You are a Senior nodejs Backend Developer**
> **Purpose:** This file contains the master prompts used to drive AI-first development of the Tisra backend.
> **Last Updated:** 2026-03-28

---

## Prompt 1: Project Initialization & Base Setup

```
You are building the backend for "Tisra" — a collaborative music-listening platform.

CONTEXT FILES (read these first):
- .ai-context/BRD.md — Business Requirements Document
- .ai-context/coding-standards.md — Coding Standards
- .ai-context/architechture.md — Architecture Document

TASK:
Set up the project foundation. Do NOT implement any feature modules yet.

1. Update `package.json`:
   - Add all required dependencies: express, socket.io, @prisma/client, jsonwebtoken, bcrypt, joi, dotenv, cors, helmet, express-rate-limit, winston
   - Add dev dependencies: typescript, ts-node-dev, @types/express, @types/node, @types/bcrypt, @types/jsonwebtoken, @types/cors, jest, ts-jest, @types/jest, eslint, prettier, prisma
   - Add scripts: "dev", "build", "start", "lint", "test", "prisma:generate", "prisma:migrate"

2. Create `tsconfig.json` with strict mode (as per coding-standards.md section 1.2).

3. Create `.env.example` with all environment variables listed in architechture.md section 9.

4. Create `src/config/env.ts` — validate and export all env vars with proper types.

5. Create `src/config/database.ts` — Prisma client singleton.

6. Create `src/errors/app-error.ts` — base AppError class.
   Create `src/errors/index.ts` — export all error classes (NotFoundError, ConflictError, UnauthorizedError, ForbiddenError, ValidationError).

7. Create `src/middlewares/error-handler.ts` — centralized error handling middleware.

8. Create `src/utils/logger.ts` — winston logger setup.

9. Create `src/app.ts` — Express app with helmet, cors, rate-limiter, JSON parser, route mounting, error handler.

10. Create `src/server.ts` — HTTP server + Socket.IO bootstrap.

11. Create `src/types/common.types.ts` — ApiResponse, PaginatedResponse, AuthenticatedRequest interfaces.

CONSTRAINTS:
- Follow ALL coding standards from coding-standards.md.
- NEVER use `any` type.
- Every function must have explicit return types.
- Use the folder structure from architechture.md section 2.
```

---

## Prompt 2: Prisma Schema & Database Models

```
CONTEXT: Read .ai-context/BRD.md sections 9 (Database Entities) and .ai-context/architechture.md section 7.

TASK:
Create the Prisma schema in `prisma/schema.prisma` with all entities:

1. User — id (UUID), email (unique), username (unique), passwordHash, displayName, avatarUrl (nullable), createdAt, updatedAt
2. Room — id (UUID), code (unique, 6-char), name, hostId (FK → User), maxParticipants (default 10), isActive (default true), currentTrackId (nullable, Spotify track ID string), playbackState (enum: PLAYING, PAUSED, STOPPED), playbackPosition (Int, ms), createdAt, updatedAt
3. RoomParticipant — id (UUID), roomId (FK → Room), userId (FK → User), joinedAt. Unique constraint on (roomId, userId).
4. ChatMessage — id (UUID), roomId (FK → Room), senderId (FK → User), content (max 500 chars), createdAt
5. Playlist — id (UUID), name, userId (FK → User), createdAt, updatedAt
6. PlaylistTrack — id (UUID), playlistId (FK → Playlist), spotifyTrackId, trackName, artistName, albumArt (nullable), durationMs, addedAt. Unique constraint on (playlistId, spotifyTrackId).

Define proper relations, cascade deletes, and indexes on foreign keys.
Create an enum `PlaybackState` with values PLAYING, PAUSED, STOPPED.

After schema creation, run: npx prisma generate
```

---

## Prompt 3: Authentication Module

```
CONTEXT: Read all .ai-context files.

TASK:
Implement the complete Authentication module following the architecture pattern:

1. `src/types/auth.types.ts` — RegisterInput, LoginInput, AuthTokens, JwtPayload, RegisterOutput, LoginOutput interfaces
2. `src/validators/auth/index.ts` — registerValidator, loginValidator, refreshTokenValidator (Joi)
3. `src/repositories/user/index.ts` — UserRepository class with: findByEmail, findByUsername, findById, create
4. `src/services/auth/helper.ts` — hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken
5. `src/services/auth/index.ts` — AuthService class with: register, login, refreshToken, logout
6. `src/controllers/auth/index.ts` — registerController, loginController, refreshTokenController, logoutController
7. `src/routes/auth/index.ts` — authRouter with all auth endpoints
8. `src/middlewares/auth.ts` — authMiddleware (JWT verification, attach user to request)

Wire auth routes into `src/routes/index.ts`.

CONSTRAINTS:
- Route pattern: router.post('/register', registerValidator, registerController)
- Controller only accepts req and sends res — no business logic.
- Service contains all business logic — no req/res access.
- Repository only does Prisma queries.
```

---

## Prompt 3.1: OTP Module (Nodemailer)

```
CONTEXT: Read all .ai-context files. Auth module is already implemented.

TASK:
Implement OTP (One-Time Password) module for email verification and password reset:

1. `src/types/otp.types.ts` — OtpRequest, OtpVerifyInput, OtpGenerateOutput, OtpVerifyOutput interfaces
2. `src/validators/otp/index.ts` — otpRequestValidator, otpVerifyValidator
3. `src/repositories/otp/index.ts` — OtpRepository class with: create, findByCode, findByEmail, findByPhone, update, delete, findValidByCode
4. `src/services/otp/helper.ts` — generateOtpCode (6-digit), sendOtpEmail, sendOtpSms (mocked), verifyOtpCode
5. `src/services/otp/index.ts` — OtpService class with: requestOtp (email/phone), verifyOtp (email/phone + code), generateOtpCode, sendOtpEmail, sendOtpSms
6. `src/controllers/otp/index.ts` — requestOtpController, verifyOtpController
7. `src/routes/otp/index.ts` — otpRouter with endpoints: POST /request, POST /verify

Mount otpRouter into `src/routes/index.ts`.

CONSTRAINTS:
- OTP code must be 6 digits
- OTP expires after 10 minutes
- Max 3 attempts per OTP
- After successful verification, OTP must be invalidated
- Use email or phone as identifier
- Email verification for registration, password reset
- Phone verification for future SMS features (mock for now)
```

---

## Prompt 4: User Profile Module

```
CONTEXT: Read all .ai-context files. Auth module is already implemented.

TASK:
Implement the User Profile module:

1. `src/types/user.types.ts` — UpdateProfileInput, UserProfile interfaces
2. `src/validators/user/index.ts` — updateProfileValidator
3. `src/services/user/index.ts` — UserService with: getProfile, updateProfile
4. `src/controllers/user/index.ts` — getProfileController, updateProfileController
5. `src/routes/user/index.ts` — userRouter (all routes protected by authMiddleware)

Mount on `/api/users`.
```

---

## Prompt 5: Spotify Integration Module

```
CONTEXT: Read all .ai-context files.

TASK:
Implement Spotify integration:

1. `src/config/spotify.ts` — SpotifyClient class:
   - Manages Client Credentials token (auto-refresh on expiry)
   - Methods: getAccessToken(), refreshToken()
   - Caches token with expiry tracking

2. `src/types/music.types.ts` — SpotifyTrack, SpotifySearchResult, SpotifyAlbum, SpotifyArtist, SearchQueryParams interfaces

3. `src/services/music/helper.ts` — Helper functions to call Spotify API endpoints (search, get track, featured playlists, new releases)

4. `src/services/music/index.ts` — MusicService with: search, getTrackDetails, getFeaturedPlaylists, getNewReleases

5. `src/validators/music/index.ts` — searchValidator, getTrackValidator

6. `src/controllers/music/index.ts` — searchController, getTrackController, getFeaturedController, getNewReleasesController

7. `src/routes/music/index.ts` — musicRouter (all routes protected)

Mount on `/api/music`.
```

---

## Prompt 6: Room Module (REST API)

```
CONTEXT: Read all .ai-context files. Auth, User, and Music modules are done.

TASK:
Implement Room management REST endpoints:

1. `src/types/room.types.ts` — CreateRoomInput, RoomDetails, RoomState interfaces
2. `src/validators/room/index.ts` — createRoomValidator, joinRoomValidator, kickUserValidator
3. `src/repositories/room/index.ts` — RoomRepository (create, findById, findByCode, update, delete, addParticipant, removeParticipant, getParticipants)
4. `src/repositories/room-participant/index.ts` — RoomParticipantRepository
5. `src/services/room/helper.ts` — generateRoomCode (unique 6-char alphanumeric)
6. `src/services/room/index.ts` — RoomService (createRoom, joinRoom, leaveRoom, closeRoom, kickUser, getRoomDetails, updatePlayback — host-only check)
7. `src/controllers/room/index.ts` — All room controllers
8. `src/routes/room/index.ts` — roomRouter (all routes protected)

Host-only actions MUST be enforced at the service layer.
Mount on `/api/rooms`.
```

---

## Prompt 7: Socket.IO — Room Sync & Chat

```
CONTEXT: Read all .ai-context files, especially BRD.md sections 8 (Socket Events) and architechture.md section 4.

TASK:
Implement real-time features:

1. `src/types/socket.types.ts` — All socket event payload types (RoomJoinPayload, ChatMessagePayload, PlaybackActionPayload, etc.)
2. `src/middlewares/socket-auth.ts` — Socket.IO auth middleware (verify JWT from handshake)
3. `src/sockets/index.ts` — initializeSocketIO function, register handlers
4. `src/sockets/room-handler.ts`:
   - room:join → add socket to room, broadcast room:user-joined, send room:state
   - room:leave → remove socket from room, broadcast room:user-left
   - playback:action → verify host → update room state → broadcast playback:update
5. `src/sockets/chat-handler.ts`:
   - chat:message → validate content → persist to DB → broadcast to room
6. `src/repositories/chat-message/index.ts` — ChatMessageRepository (create, findByRoomId with pagination)
7. `src/services/chat/index.ts` — ChatService (sendMessage, getHistory)

Update `src/server.ts` to initialize Socket.IO.
```

---

## Prompt 8: Playlist Module (Optional / P2)

```
CONTEXT: Read all .ai-context files.

TASK:
Implement personal playlist management:

1. `src/repositories/playlist/index.ts` — PlaylistRepository
2. `src/repositories/playlist-track/index.ts` — PlaylistTrackRepository
3. `src/services/playlist/index.ts` — PlaylistService (createPlaylist, getPlaylists, addTrack, removeTrack, deletePlaylist)
4. `src/validators/playlist/index.ts` — validators
5. `src/controllers/playlist/index.ts` — controllers
6. `src/routes/playlist/index.ts` — playlistRouter

Mount on `/api/playlists`.
```

---

## Usage Instructions

1. Execute prompts **in order** (Prompt 1 → 2 → 3 → ... → 8).
2. After each prompt, **verify** the generated code compiles (`npm run build`) and passes lint.
3. After Prompt 3, write and run authentication unit tests.
4. After Prompt 7, test Socket.IO events manually or with a test client.
5. Log each prompt execution in `prompt-history.md` with date, time, and outcome.
