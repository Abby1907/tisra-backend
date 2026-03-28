# Tisra — Business Requirements Document (BRD)

> **Project Name:** Tisra
> **Version:** 1.0.0
> **Last Updated:** 2026-03-28
> **Platform:** Backend API (Node.js / TypeScript)

---

## 1. Executive Summary

Tisra is a collaborative music-listening platform that allows users to listen to music individually or together in shared rooms. The application leverages the **Spotify Web API** for all music-related operations (search, playback, track metadata) and provides real-time features such as room-based synchronized listening and in-room chat via **Socket.IO**.

---

## 2. Objectives

| #   | Objective                                                                               |
| --- | --------------------------------------------------------------------------------------- |
| O1  | Allow users to register and log in securely using JWT-based authentication.             |
| O2  | Enable individual music listening experience powered by Spotify.                        |
| O3  | Enable collaborative music listening via rooms where multiple users join.               |
| O4  | Restrict music control (play, pause, skip, change track) in rooms to the **host** only. |
| O5  | Provide real-time in-room chat so room participants can communicate.                    |
| O6  | Integrate Spotify's Web API using application-level Client ID & Client Secret.          |

---

## 3. Stakeholders

| Role             | Description                                                                      |
| ---------------- | -------------------------------------------------------------------------------- |
| End User         | Registers, logs in, listens to music solo or in rooms, chats.                    |
| Room Host        | The user who creates a room; has exclusive music control.                        |
| Room Participant | A user who joins an existing room; can listen and chat but cannot control music. |
| System Admin     | Manages application configuration, Spotify credentials, monitoring.              |

---

## 4. Functional Requirements

### 4.1 Authentication Module

| ID         | Requirement                                                                                        | Priority |
| ---------- | -------------------------------------------------------------------------------------------------- | -------- |
| FR-AUTH-01 | Users can register with email, username, and password, with OTP validation in email via nodemailer | P0       |
| FR-AUTH-02 | Users can log in with email/username and password.                                                 | P0       |
| FR-AUTH-03 | JWT access token and refresh token are issued on successful login.                                 | P0       |
| FR-AUTH-04 | Protected routes require a valid JWT access token.                                                 | P0       |
| FR-AUTH-05 | Users can refresh expired access tokens using the refresh token.                                   | P0       |
| FR-AUTH-06 | Users can log out (invalidate refresh token).                                                      | P1       |
| FR-AUTH-07 | Passwords are hashed using bcrypt before storage.                                                  | P0       |

### 4.2 User Profile Module

| ID         | Requirement                                     | Priority |
| ---------- | ----------------------------------------------- | -------- |
| FR-USER-01 | Users can view their own profile.               | P1       |
| FR-USER-02 | Users can update their display name and avatar. | P2       |

### 4.3 Spotify Integration Module

| ID         | Requirement                                                                                       | Priority |
| ---------- | ------------------------------------------------------------------------------------------------- | -------- |
| FR-SPOT-01 | The backend authenticates with Spotify using Client Credentials flow (Client ID + Client Secret). | P0       |
| FR-SPOT-02 | Users can search for tracks, albums, and artists via Spotify Search API.                          | P0       |
| FR-SPOT-03 | Users can get track details (name, artist, album art, duration, preview URL).                     | P0       |
| FR-SPOT-04 | The backend caches the Spotify access token and auto-refreshes on expiry.                         | P0       |
| FR-SPOT-05 | Users can browse featured playlists / new releases.                                               | P2       |

### 4.4 Individual Listening Module

| ID           | Requirement                                                                | Priority |
| ------------ | -------------------------------------------------------------------------- | -------- |
| FR-LISTEN-01 | Users can play a track (returns Spotify preview URL or playback metadata). | P0       |
| FR-LISTEN-02 | Users can pause, resume, skip, and seek within a track.                    | P1       |
| FR-LISTEN-03 | Users can create and manage personal playlists (CRUD).                     | P2       |
| FR-LISTEN-04 | Users can add/remove tracks from personal playlists.                       | P2       |

### 4.5 Room Module

| ID         | Requirement                                                                                          | Priority |
| ---------- | ---------------------------------------------------------------------------------------------------- | -------- |
| FR-ROOM-01 | Authenticated users can create a room (they become the host).                                        | P0       |
| FR-ROOM-02 | Rooms have a unique room code/ID that can be shared for joining.                                     | P0       |
| FR-ROOM-03 | Authenticated users can join an existing room using the room code.                                   | P0       |
| FR-ROOM-04 | Only the **host** can play, pause, skip, or change the currently playing track in the room.          | P0       |
| FR-ROOM-05 | All participants hear the same track synchronized to the host's playback state.                      | P0       |
| FR-ROOM-06 | The host can remove participants from the room.                                                      | P1       |
| FR-ROOM-07 | Participants can leave a room voluntarily.                                                           | P0       |
| FR-ROOM-08 | When the host leaves, the room is closed (or ownership transfers — configurable).                    | P1       |
| FR-ROOM-09 | Room state (current track, playback position, participants) is broadcast in real time via Socket.IO. | P0       |
| FR-ROOM-10 | A room has a maximum participant limit (configurable, default: 10).                                  | P2       |

### 4.6 Chat Module (In-Room)

| ID         | Requirement                                                               | Priority |
| ---------- | ------------------------------------------------------------------------- | -------- |
| FR-CHAT-01 | Participants in a room can send text messages in real time via Socket.IO. | P0       |
| FR-CHAT-02 | Messages are broadcast to all participants in the same room.              | P0       |
| FR-CHAT-03 | Each message includes sender info, timestamp, and content.                | P0       |
| FR-CHAT-04 | Chat history is persisted and retrievable when a user joins a room.       | P1       |
| FR-CHAT-05 | Messages can have a maximum length (e.g., 500 characters).                | P1       |

---

## 5. Non-Functional Requirements

| ID     | Requirement                                                            | Category        |
| ------ | ---------------------------------------------------------------------- | --------------- |
| NFR-01 | API response time < 200ms for non-Spotify endpoints under normal load. | Performance     |
| NFR-02 | WebSocket connections handled via Socket.IO with reconnection support. | Reliability     |
| NFR-03 | All sensitive data (passwords, tokens) must be encrypted/hashed.       | Security        |
| NFR-04 | Rate limiting on auth endpoints (max 10 requests/min per IP).          | Security        |
| NFR-05 | Input validation on all endpoints using Joi.                           | Security        |
| NFR-06 | Structured logging with correlation IDs.                               | Observability   |
| NFR-07 | CORS configuration for allowed frontend origins.                       | Security        |
| NFR-08 | Environment-based configuration (dev, staging, production).            | Maintainability |
| NFR-09 | Code coverage target: ≥ 80% for services and repositories.             | Quality         |

---

## 6. Tech Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| Runtime          | Node.js (LTS)                             |
| Language         | TypeScript (strict mode)                  |
| Framework        | Express.js                                |
| Real-time        | Socket.IO                                 |
| Database         | PostgreSQL                                |
| ORM              | Prisma                                    |
| Authentication   | JWT (jsonwebtoken)                        |
| Password Hashing | bcrypt                                    |
| Validation       | Joi                                       |
| Music API        | Spotify Web API (Client Credentials flow) |
| Environment      | dotenv                                    |
| OTP              | nodemailer                                |

---

## 7. API Endpoints Overview

### Auth

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| POST   | `/api/auth/v1/register` | Register a new user       |
| POST   | `/api/auth/v1/login`    | Log in and receive tokens |
| POST   | `/api/auth/v1/refresh`  | Refresh access token      |
| POST   | `/api/auth/v1/logout`   | Invalidate refresh token  |

### User

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| GET    | `/api/v1/users/me` | Get current user profile |
| PATCH  | `/api/v1/users/me` | Update profile           |

### Spotify / Music

| Method | Endpoint                      | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/api/music/search?q=<query>` | Search tracks/albums/artists |
| GET    | `/api/music/tracks/:trackId`  | Get track details            |
| GET    | `/api/music/featured`         | Get featured playlists       |
| GET    | `/api/music/new-releases`     | Get new releases             |

### Room

| Method | Endpoint                             | Description                     |
| ------ | ------------------------------------ | ------------------------------- |
| POST   | `/api/v1/rooms`                      | Create a new room               |
| GET    | `/api/v1/rooms/:roomId`              | Get room details                |
| POST   | `/api/v1/rooms/:roomId/join`         | Join a room                     |
| POST   | `/api/v1/rooms/:roomId/leave`        | Leave a room                    |
| DELETE | `/api/v1/rooms/:roomId`              | Close/delete a room (host only) |
| POST   | `/api/v1/rooms/:roomId/kick/:userId` | Kick a user (host only)         |

### Room Playback (host only — enforced server-side)

| Method | Endpoint                               | Description         |
| ------ | -------------------------------------- | ------------------- |
| POST   | `/api/v1/rooms/:roomId/playback/play`  | Play / change track |
| POST   | `/api/v1/rooms/:roomId/playback/pause` | Pause playback      |
| POST   | `/api/v1/rooms/:roomId/playback/skip`  | Skip to next track  |

---

## 8. Socket.IO Events

### Client → Server

| Event             | Payload                        | Description                   |
| ----------------- | ------------------------------ | ----------------------------- |
| `room:join`       | `{ roomId }`                   | Join a room's socket channel  |
| `room:leave`      | `{ roomId }`                   | Leave a room's socket channel |
| `chat:message`    | `{ roomId, content }`          | Send a chat message           |
| `playback:action` | `{ roomId, action, trackId? }` | Host sends a playback command |

### Server → Client

| Event              | Payload                                         | Description            |
| ------------------ | ----------------------------------------------- | ---------------------- |
| `room:state`       | `{ currentTrack, playbackState, participants }` | Full room state sync   |
| `room:user-joined` | `{ userId, username }`                          | A user joined the room |
| `room:user-left`   | `{ userId, username }`                          | A user left the room   |
| `chat:message`     | `{ sender, content, timestamp }`                | Broadcast chat message |
| `playback:update`  | `{ action, trackId?, position? }`               | Playback state update  |
| `room:closed`      | `{ reason }`                                    | Room was closed        |
| `error`            | `{ code, message }`                             | Error notification     |

---

## 9. Database Entities (High-Level)

| Entity              | Key Fields                                                                      |
| ------------------- | ------------------------------------------------------------------------------- |
| **User**            | id, email, username, passwordHash, displayName, avatarUrl, createdAt, updatedAt |
| **Room**            | id, code, name, hostId (FK → User), maxParticipants, isActive, createdAt        |
| **RoomParticipant** | id, roomId (FK → Room), userId (FK → User), joinedAt                            |
| **ChatMessage**     | id, roomId (FK → Room), senderId (FK → User), content, createdAt                |
| **Playlist**        | id, name, userId (FK → User), createdAt, updatedAt                              |
| **PlaylistTrack**   | id, playlistId (FK → Playlist), spotifyTrackId, addedAt                         |

---

## 10. Glossary

| Term                    | Definition                                                                 |
| ----------------------- | -------------------------------------------------------------------------- |
| Host                    | The user who created a room and has exclusive music control.               |
| Participant             | Any user currently in a room, including the host.                          |
| Playback State          | Current track, play/pause status, and position in the track.               |
| Client Credentials Flow | Spotify OAuth flow using app-level credentials (no user login to Spotify). |
| Room Code               | A unique, shareable identifier for joining a room.                         |
