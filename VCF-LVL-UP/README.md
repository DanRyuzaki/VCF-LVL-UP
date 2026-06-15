# eFaith Connect — Youth eSports Management System

A digital management system for Faith-Based Youth eSports Events at **Word Baptist Church, Inc.**

Built with **Next.js 14 (TypeScript)** and **Tailwind CSS**.

---

## Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Framework | Next.js 14 (App Router)     |
| Language  | TypeScript                  |
| Styling   | Tailwind CSS                |
| Fonts     | Rajdhani + Inter (Google)   |
| Icons     | Custom inline SVG           |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
eFaith-connect/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Landing Page
│   │   ├── login/page.tsx       # Unified Login Page
│   │   ├── gamer/page.tsx       # Gamer Dashboard
│   │   ├── organizer/page.tsx   # Organizer Dashboard
│   │   ├── admin/page.tsx       # Admin Dashboard
│   │   └── developer/page.tsx   # Developer Dashboard
│   │
│   ├── components/
│   │   ├── landing/             # Landing page section components
│   │   │   ├── herosection.tsx
│   │   │   ├── tourna.tsx
│   │   │   ├── overview.tsx
│   │   │   ├── ancment.tsx
│   │   │   ├── matches.tsx
│   │   │   ├── live.tsx
│   │   │   ├── access.tsx
│   │   │   └── login.tsx
│   │   ├── login/               # Login page components
│   │   │   ├── role-selector.tsx
│   │   │   ├── consent-modal.tsx
│   │   │   └── login-form.tsx
│   │   └── shared/              # Reusable UI components
│   │       ├── navbar.tsx
│   │       ├── sidebar.tsx
│   │       ├── stat-card.tsx
│   │       ├── page-header.tsx
│   │       └── icons.tsx
│   │
│   ├── dashboards/              # Role-based dashboard components
│   │   ├── gamerdashboard.tsx
│   │   ├── organizerdashboard.tsx
│   │   ├── admindashboard.tsx
│   │   └── developerdashboard.tsx
│   │
│   ├── modules/                 # Feature modules (RBAC-controlled)
│   │   ├── user-management/
│   │   ├── team-management/
│   │   ├── tournament-management/
│   │   ├── bracket-management/
│   │   ├── announcement-management/
│   │   ├── calendar-management/
│   │   └── livestream-management/
│   │
│   ├── data/                    # Mock static data (replace with Firebase)
│   │   ├── announcements.ts
│   │   ├── matches.ts
│   │   ├── livestreams.ts
│   │   └── tournaments.ts
│   │
│   ├── lib/
│   │   └── roles.ts             # RBAC role configuration
│   │
│   └── types/                   # TypeScript type definitions
│       ├── user.ts
│       ├── tournament.ts
│       └── announcement.ts
│
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## Page Routes

| Route          | Description                  | Access        |
|----------------|------------------------------|---------------|
| `/`            | Landing Page                 | Public        |
| `/login`       | Unified Login (all roles)    | Public        |
| `/gamer`       | Gamer Dashboard              | Gamer only    |
| `/organizer`   | Organizer Dashboard          | Organizer only|
| `/admin`       | Admin Dashboard              | Admin only    |
| `/developer`   | Developer Dashboard          | Developer only|

---

## User Roles & Permissions

### Gamer
- View profile, update profile
- View team roster and information
- View tournament schedule and brackets
- View announcements
- Access livestream

### Organizer
- Create and manage teams
- Draft and assign players
- Create and manage tournaments
- Generate and manage brackets
- Record match results
- Submit announcements (pending admin approval)
- Submit calendar events (pending admin approval)

### Admin
- Approve/reject organizer submissions (announcements, calendar events)
- Approve organizer accounts
- Manage livestream links
- Monitor tournaments and registrations
- View reports

### Developer
- View system logs and error reports
- View user metadata
- Manage roles and suspend/restore accounts
- Access maintenance tools
- Manage CRM records

---

## Design System

| Token          | Value     | Usage                          |
|----------------|-----------|--------------------------------|
| Primary BG     | `#0A0A0A` | Page background                |
| Secondary BG   | `#121212` | Navbar, sidebar                |
| Card BG        | `#1A1A1A` | Cards, panels                  |
| Elevated       | `#232323` | Table headers, inputs          |
| Border         | `#2E2E2E` | Dividers, card borders         |
| Accent Red     | `#FF4655` | CTAs, active states, alerts    |
| Accent Teal    | `#00F5D4` | Status badges, winners         |
| Accent Purple  | `#8B5CF6` | Team branding, organizer role  |
| Text Primary   | `#FFFFFF` | Headings                       |
| Text Secondary | `#B8B8B8` | Body text                      |
| Text Muted     | `#808080` | Labels, placeholders           |

---

## Data Privacy Compliance

The login page includes a **Data Privacy Consent Modal** in compliance with the **Data Privacy Act of 2012 (Republic Act No. 10173)**. Users must read and explicitly agree before proceeding.

---

## Backend Integration (Out of Scope)

This project is a **front-end only** implementation. To connect a backend:
- Replace mock data in `src/data/` with **Firebase Firestore** calls
- Implement authentication via **Firebase Auth**
- Add route protection using Next.js middleware
- Store files with **Firebase Storage**

---

## Build for Production

```bash
npm run build
npm start
```
