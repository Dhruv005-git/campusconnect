# CampusConnect 🎓

A dedicated campus marketplace where students can buy, sell, lend, and share academic resources with verified members of their college community.

> Built for PDPU Gandhinagar — a trusted peer-to-peer academic exchange network.

---

## 🚀 Live Demo

> Frontend: [Coming soon]
> Backend API: [Coming soon]

---

## 📌 Problem Statement

Students in colleges frequently need academic resources such as textbooks, calculators, lab coats, and study notes. These resources are often expensive and used only for a short period.

Currently, students rely on informal WhatsApp groups, word-of-mouth, or random platforms like OLX — which are inefficient, unorganized, and lack trust.

**CampusConnect** solves this by providing a dedicated, verified-only campus platform.

---

## ✨ Features

### 🛍️ Student Marketplace
- Buy and sell used academic items (textbooks, calculators, lab equipment, etc.)
- Image uploads with Cloudinary
- Search and filter by category, department, semester, and price

### 🤝 Lending System
- Lend items temporarily to fellow students
- Borrow request system with duration slider
- Approve, reject, and mark as returned

### 📄 Notes & Academic Resources
- Upload and share lecture notes, PYQs, assignments, and projects
- PDF and image support
- Filter by subject, semester, and department
- Download counter

### 🔐 College-Only Authentication
- Register with college email only (`@pdpu.ac.in`)
- OTP-based email verification
- JWT-based secure login

### 💬 Messaging
- In-app messaging between buyers and sellers
- Conversation threads with unread badge
- Auto-refresh every 5 seconds

### 👤 Profile Page
- View and edit your profile
- My listings and my notes in one place
- Delete your own content

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| Tailwind CSS v4 | Utility-first styling |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| Framer Motion | Smooth animations |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| JWT | Authentication tokens |
| Bcrypt.js | Password hashing |
| Nodemailer | OTP email delivery |
| Multer | File upload handling |
| Cloudinary | Image and file hosting |

---

## 📁 Project Structure

```
campusconnect/
├── campusconnect-frontend/
│   └── src/
│       ├── api/              # Axios config
│       ├── components/
│       │   ├── layout/       # Navbar
│       │   └── marketplace/  # ListingCard
│       ├── context/          # AuthContext
│       ├── pages/            # All pages
│       └── utils/            # cn.js utility
│
└── campusconnect-backend/
    ├── config/               # DB + Cloudinary + Mailer
    ├── controllers/          # Business logic
    ├── middleware/           # Auth + Upload
    ├── models/               # Mongoose schemas
    ├── routes/               # Express routes
    └── utils/                # Token + OTP generators
```

---

## 🗺️ Development Phases

### ✅ Phase 1 — Project Setup
- React + Vite + Tailwind v4 frontend initialized
- Express + Node.js backend initialized
- MongoDB Atlas connected
- Folder structure established
- User and Listing schemas designed

### ✅ Phase 2 — Authentication
- College email domain validation (`@pdpu.ac.in`)
- OTP-based email verification via Nodemailer
- JWT token generation and validation
- Protected routes on frontend
- Global AuthContext with React Context API

### ✅ Phase 3 — Marketplace
- Create, read, and delete listings
- Image upload via Cloudinary (up to 4 images)
- Search by keyword
- Filter by category, department, semester
- Listing detail page with seller info

### ✅ Phase 4 — Lending System
- List items for temporary lending
- Borrow request with duration and message
- Owner can approve, reject, or mark as returned
- Availability toggle

### ✅ Phase 5 — Notes Sharing
- Upload PDFs and images
- Categorize by type (Notes, PYQ, Assignment, Project)
- Filter by department, semester, subject
- Download counter tracking

### ✅ Phase 6 — Messaging
- In-app messaging between users
- Conversation list with last message preview
- Unread message badge in navbar
- Auto-refresh polling every 5 seconds

### ✅ Phase 7 — UI Polish
- Responsive layout across all pages
- Framer Motion animations (fade, stagger, scroll-triggered)
- Loading skeleton states
- Empty states with CTAs
- Home/Landing page with hero, stats, feature cards

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account with App Password enabled

### Backend Setup

```bash
cd campusconnect-backend
npm install
```

Create a `.env` file:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campusconnect
JWT_SECRET=your_secret_key
PORT=5000
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd campusconnect-frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with college email |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Listings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/listings` | Get all listings (with filters) |
| GET | `/api/listings/:id` | Get single listing |
| POST | `/api/listings` | Create listing |
| DELETE | `/api/listings/:id` | Delete listing |
| PATCH | `/api/listings/:id/toggle` | Toggle availability |

### Notes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes |
| POST | `/api/notes` | Upload note |
| PATCH | `/api/notes/:id/download` | Increment download count |
| DELETE | `/api/notes/:id` | Delete note |

### Lending
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/lend` | Get all lend items |
| POST | `/api/lend` | Create lend item |
| POST | `/api/lend/:id/borrow` | Send borrow request |
| GET | `/api/lend/my-requests` | My borrow requests |
| GET | `/api/lend/item-requests` | Requests for my items |
| PATCH | `/api/lend/requests/:id` | Approve/reject/return |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/conversations` | Get all conversations |
| GET | `/api/messages/:otherUserId` | Get messages with user |
| POST | `/api/messages` | Send message |
| GET | `/api/messages/unread` | Get unread count |

---

## 🐛 Known Issues & Roadmap

### Known Issues
- Messages require page refresh (no Socket.io yet)
- Profile page fetches all listings client-side

### Planned for v2
- Real-time messaging with Socket.io
- Push notifications
- Seller ratings and reviews
- Wishlist / saved items
- Multi-college support
- Admin dashboard with analytics

---

## 👥 Target Users

- **Seniors** — Sell unused academic materials, lend equipment, share notes
- **Juniors** — Buy cheaper materials, borrow items, access study resources

---

## 🤝 Contributing

This project is currently for PDPU Gandhinagar students only. For suggestions or issues, please open a GitHub issue.

---

## 📄 License

MIT License — feel free to fork and adapt for your own college!

---

<div align="center">
  Made with ❤️ for PDPU Gandhinagar students
</div>
