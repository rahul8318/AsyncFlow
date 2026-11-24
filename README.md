# AsyncFlow — Enterprise Remote Work & Asynchronous Operations Platform

[![CI/CD Pipeline](https://github.com/AsyncFlow/asyncflow/actions/workflows/ci.yml/badge.svg)](https://github.com/AsyncFlow/asyncflow/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)

AsyncFlow is a production-grade enterprise SaaS platform designed to eliminate meeting sprawl, establish structured asynchronous operations, and empower distributed organizations to operate with high velocity across global time zones.

---

## 1. Product Vision & Architecture

Unlike traditional task managers or chat apps that incentivize constant interruptions and context switching, AsyncFlow provides a **complete operating system for asynchronous leverage**:

- **Living SOP Management System:** Author, version-control, assign, and digitally acknowledge standard operating procedures with audit timestamping.
- **Visual Stage-Gated Workflows:** Kanban pipelines for remote onboarding, weekly reporting cadences, and incident escalations with multi-level manager approvals.
- **Continuous Learning LMS & Quizzing:** Structured modular employee training programs, reading tracking, and server-side graded competency assessments with digital certification.
- **Interactive Workshops & Live Sessions:** Facilitated sessions on silent meetings, cross-timezone handoffs, and feedback management.
- **Real Database-Calculated Analytics:** Real KPIs derived from persistent PostgreSQL records—compliance rates, communication scores, and downloadable CSV exports.
- **Strict Multi-Tenant Isolation:** Complete logical tenant separation and role-based access control (Super Admin, Org Admin, Team Manager, Employee).

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **UI Components:** Clean Enterprise Design System (Cards, Modals, Badges, Tables, Skeletons)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Server State & Realtime:** TanStack Query v5, Socket.IO Client
- **Form Handling & Validation:** React Hook Form, Zod

### Backend
- **Runtime:** Node.js 22 LTS, Express.js, TypeScript (ESM)
- **Database & ORM:** PostgreSQL 17, Prisma ORM
- **Cache & Rate Limiting:** Redis with in-memory fallback
- **Authentication & Security:** JWT Access & Rotating Refresh Tokens, Argon2/Bcrypt password hashing, Helmet security headers, CORS, Cookie-parser
- **File Uploads:** Multer with MIME validation and disk storage
- **API Documentation:** OpenAPI 3.0 / Swagger UI (`/api-docs`)
- **Realtime Engine:** Socket.IO for live notification broadcasts

---

## 3. Seeded Accounts & Demo Credentials

The database comes pre-seeded with real enterprise data (Acme Global Technologies), departments, teams, 10 SOP templates, onboarding workflows, training courses, assessments, and workshops.

| Role | Email | Password | Organization | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@asyncflow.io` | `Password123!` | Platform Global | Global administration & multi-org monitoring |
| **Org Admin** | `admin@acme.com` | `Password123!` | Acme Global Technologies | Create departments/teams, author SOPs, invite members, view analytics |
| **Team Manager** | `manager@acme.com` | `Password123!` | Acme Global Technologies | Manage squads, assign SOPs, review workflow approvals |
| **Employee** | `employee@acme.com` | `Password123!` | Acme Global Technologies | Read & acknowledge SOPs, complete lessons, take certification exams |

---

## 4. Quick Start & Local Setup

### Prerequisites
- Node.js >= 22.0.0
- npm >= 10.0.0
- PostgreSQL >= 15 (Local installation on port 5432 or via Docker)

### Option A: Local Development (Native)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AsyncFlow/asyncflow.git
   cd asyncflow
   ```

2. **Configure Backend Environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials if different:
   # DATABASE_URL="postgresql://postgres:postgres@localhost:5432/asyncflow_dev?schema=public"
   ```

3. **Install Dependencies & Seed Database:**
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Start Backend Dev Server:**
   ```bash
   npm run dev
   # Backend running at http://localhost:5000
   # Swagger Docs at http://localhost:5000/api-docs
   # Health check at http://localhost:5000/health
   ```

5. **Start Frontend Client:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   # Frontend running at http://localhost:5173
   ```

### Option B: Docker Compose Deployment

Run the complete multi-container stack (Frontend + Backend + PostgreSQL + Redis):

```bash
docker compose up --build
```

- Application UI: `http://localhost`
- Backend API: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api-docs`

---

## 5. Pre-Loaded Enterprise SOP Templates

AsyncFlow ships with 10 production standard operating procedures:

1. **Async Communication Policy:** Foundational principles, focus hours, and 4-8 hour response SLAs.
2. **Remote Meeting Guidelines:** Silent reading memos, agenda enforcement, and meeting deprecation rules.
3. **Slack/Teams Communication Standards:** Channel naming taxonomy and thread discipline.
4. **Email Response Expectations:** Categorization tags `[ACTION REQUIRED]`, `[INFO]`, and SLAs.
5. **Documentation Standards:** Single Source of Truth (SSOT) and 90-day review cycles.
6. **Decision-Making Framework:** DACI (Driver, Approver, Contributors, Informed) model.
7. **Incident Escalation Process:** Pager trees, Incident Commander roles, and blameless post-mortems.
8. **Daily & Weekly Team Updates:** 3-bullet async standups and Friday reflections.
9. **Remote Work Availability Policy:** Core 2-hour squad overlap and right-to-disconnect.
10. **Cross-Time-Zone Collaboration Guidelines:** Follow-the-sun handoff memos and branch state sharing.

---

## 6. Testing & Quality Assurance

Run the automated test suites:

```bash
# Backend Automated Tests (Auth, Tenant Isolation, SOPs, Workflows, LMS, Quizzes)
cd backend
npm test

# Frontend Unit Tests (Components, Formatters, Utilities)
cd ../frontend
npm test
```

---

## 7. License

AsyncFlow is distributed under the MIT License. See [LICENSE](LICENSE) for more details.
