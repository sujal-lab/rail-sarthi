# Rail सारथी (Rail-Sarthi)

> **Safar Aapka, Saarthi Hum** — A full-stack railway booking platform with AI-powered travel recommendations.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Running the App](#-running-the-app)
- [Testing](#-testing)
- [API Routes](#-api-routes)
- [Database Architecture](#-database-architecture)

---

## ✨ Features

| Feature | Description |
|---|---|
| **User Authentication** | Signup/Login with bcrypt password hashing and JWT tokens (cookie-based sessions) |
| **Role-Based Access** | Admin and User roles. Admin emails configurable via `.env` |
| **Train Management** | CRUD operations for trains (Admin only) |
| **Ticket Booking** | Book tickets with automatic seat availability tracking |
| **Waiting Queue** | When seats are full, bookings enter a FIFO waiting queue with auto-promotion on cancellation |
| **Booking Cancellation** | Cancel bookings with automatic queue re-indexing and seat restoration |
| **AI Travel Itinerary** | Gemini AI-powered travel guide showing recommended spots and hotels for your destination |
| **Real-Time Chat** | Socket.io powered live chat support |
| **Profile Image Upload** | Cloudinary-based profile picture uploads via Multer |
| **Responsive UI** | EJS templates with TailwindCSS, Phosphor Icons, and modern glassmorphism design |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js 5 |
| **View Engine** | EJS (Server-Side Rendering) |
| **Database (Relational)** | PostgreSQL via Prisma ORM — Users, Bookings |
| **Database (Document)** | MongoDB via Mongoose — Trains, Chats |
| **Authentication** | bcrypt + JSON Web Tokens (JWT) |
| **AI Integration** | Google Gemini API (gemini-2.5-flash) |
| **Real-Time** | Socket.io |
| **File Upload** | Multer + Cloudinary |
| **Styling** | TailwindCSS (CDN), Phosphor Icons |
| **Testing** | Jest |

---

## 📁 Project Structure

```
rail-sarthi/
├── prisma/
│   └── schema.prisma         # PostgreSQL schema (User, Booking)
├── public/
│   ├── js/main.js             # Client-side scripts
│   └── index.css              # Custom styles
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── prisma.js          # Prisma client singleton
│   ├── controllers/
│   │   ├── authController.js  # Login/Signup handlers
│   │   ├── bookingController.js
│   │   └── trainController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── adminAuth.js       # Admin role guard
│   │   ├── validateBooking.js # Request validation
│   │   ├── validateTrain.js
│   │   ├── validateId.js
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   └── multer.js          # File upload config
│   ├── models/
│   │   ├── Train.js           # Mongoose model
│   │   └── Chat.js            # Mongoose model
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── trainRoutes.js
│   │   ├── viewRoutes.js      # EJS page routes + AI proxy
│   │   ├── chatRoutes.js
│   │   └── uploadRoutes.js
│   └── services/
│       ├── authService.js     # Auth business logic
│       ├── bookingService.js  # Booking + queue logic
│       └── trainService.js    # Train CRUD logic
├── tests/
│   ├── authService.test.js    # Auth unit tests (7 tests)
│   ├── bookingService.test.js # Booking unit tests (8 tests)
│   └── middleware.test.js     # Middleware unit tests (11 tests)
├── views/                     # EJS templates
│   ├── home.ejs
│   ├── login.ejs / signup.ejs
│   ├── tickets.ejs
│   ├── bookings.ejs
│   ├── admin.ejs
│   └── partials/
├── app.js                     # Express app configuration
├── server.js                  # Server entry point
├── package.json
└── .env                       # Environment variables (not committed)
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** v22+ (LTS recommended)
- **PostgreSQL** (local or remote)
- **MongoDB** (local or remote)

### 1. Clone the Repository

```bash
git clone https://github.com/sujal-lab/rail-sarthi.git
cd rail-sarthi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/railsarthi
DATABASE_URL=postgresql://postgres:root@localhost:5432/railway_db
JWT_SECRET=your_jwt_secret_here
ADMIN_EMAILS=admin@example.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Setup PostgreSQL Database

```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 5. Start the Server

```bash
npm start
# or
node server.js
```

The app will be available at `http://localhost:3001`

---

## 🧪 Testing

This project uses **Jest** for unit testing. All tests use mocked dependencies (no real database connections required).

### Run Tests

```bash
npm test
```

### Test Coverage

| Test Suite | File | Tests | What's Covered |
|---|---|---|---|
| **Booking Service** | `tests/bookingService.test.js` | 8 | Seat availability (CONFIRMED/WAITING), queue position assignment, train-not-found error, cancellation with WAITING→CONFIRMED promotion, queue re-indexing, user booking retrieval |
| **Auth Service** | `tests/authService.test.js` | 7 | Signup success, duplicate user rejection, login success, invalid credentials (user not found / wrong password), JWT token payload verification |
| **Middleware** | `tests/middleware.test.js` | 11 | JWT auth (no token / valid token / invalid token), admin role guard, booking validation (missing fields / non-numeric age), ID validation |

**Total: 26 tests across 3 test suites**

### Test Architecture

- All external dependencies (Prisma, MongoDB, bcrypt, JWT) are **fully mocked** using `jest.mock()`
- Tests run in **< 1 second** with zero database overhead
- Tests validate both **success paths** and **error paths** (status codes, error messages)

---

## 🔌 API Routes

### Authentication
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | Register new user |
| POST | `/auth/login` | No | Login and receive JWT cookie |
| GET | `/auth/logout` | No | Clear session and redirect |

### Trains
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/trains` | No | List all trains |
| GET | `/trains/:id` | No | Get train by ID |
| POST | `/trains` | Admin | Create a new train |
| PUT | `/trains/:id` | Admin | Update a train |
| DELETE | `/trains/:id` | Admin | Delete a train |

### Bookings
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/bookings` | User | Book a ticket |
| GET | `/bookings` | User | Get user's bookings |
| DELETE | `/bookings/:id` | User | Cancel a booking |

### Views (EJS Pages)
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/view/home` | No | Home page |
| GET | `/view/tickets` | No | Search and view trains |
| GET | `/view/bookings` | User | My Bookings page |
| GET | `/view/admin` | Admin | Admin dashboard |
| POST | `/view/ai-itinerary` | User | AI travel guide proxy |

---

## 🗄 Database Architecture

This project uses **Polyglot Persistence** — two different databases for different data models:

```
┌─────────────────────┐     ┌─────────────────────┐
│    PostgreSQL        │     │      MongoDB         │
│    (via Prisma)      │     │    (via Mongoose)    │
├─────────────────────┤     ├─────────────────────┤
│  • Users             │     │  • Trains            │
│  • Bookings          │◄───►│  • Chats             │
│  (Relational data)   │     │  (Document data)     │
└─────────────────────┘     └─────────────────────┘
```

- **PostgreSQL** handles structured, relational data (users, bookings with foreign keys)
- **MongoDB** handles flexible, document-based data (trains with varied schedules, chat messages)
- The `Booking.trainId` field in PostgreSQL stores the MongoDB `ObjectId` as a string, creating a cross-database reference

---

## 📄 License

ISC
