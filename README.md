# SUPERSTORE BUSINESS PERFORMANCE & SALES ANALYTICS DASHBOARD
### Enterprise Full-Stack Web Application with Authentication, Theme Engine & Descriptive Analytics

A production-ready full-stack business intelligence and sales analytics platform built using **HTML5, CSS3, Vanilla JavaScript, Chart.js 4.4.1, Node.js, and Express.js**, driven entirely by the real **Kaggle Sample Superstore dataset** (9,800 records).

---

## 1. Project Introduction

In modern retail enterprise management, decision-makers require both rigorous data protection and intuitive visual clarity to understand revenue patterns, regional performance, and logistics dynamics.

The **Superstore Business Performance & Sales Analytics Dashboard** provides an executive-level descriptive analytics suite featuring:
- **Salted Bcrypt Password Hashing & Secure User Authentication**.
- **Server-Side Session Management & HTTP-Only Cookie Protection**.
- **Route Protection** ensuring only authenticated accounts can access the analytics workspace.
- **Dedicated Sub-Views & Tab Router**: Overview, Sales Analysis, Orders Workbench, Products Leaderboard, Reports Center, User Profile, and System Settings.
- **Collapsible Desktop Sidebar & Mobile Slide-Over Drawer with Backdrop**.
- **Animated KPI Counters** with smooth numeric roll-up transitions.
- **Quick Date Presets** (All 4 Years, 2018, 2017, 2016, 2015) for one-click temporal filtering.
- **Toast Notifications** and **Custom Confirmation Dialog Modals**.
- **Printable Executive Reports** with dedicated `@media print` layout and PDF export.
- **One-Click CSV Export** of active filtered transactions.
- **Fully Functional Light & Dark Mode** with zero-flicker preloading and reactive Chart.js styling.
- **5 Executive KPI Cards & 8 Interactive Chart.js Visualizations**.
- **Data Quality Audit Modal** certifying 100% preservation of all 9,800 records and revenue ($2,261,536.93).

---

## 2. Business Problem & Objectives

### Business Problem
Retail managers and business analysts face key operational bottlenecks:
- **Security & Multi-Tenant Access**: Inability to restrict proprietary sales metrics to authenticated personnel.
- **Visual Ergonomics**: Eye strain during extended data auditing without adaptive Light and Dark viewing modes.
- **Revenue Transparency**: Difficulty synthesizing 9,800 transactional rows into actionable category and regional conclusions.

### Project Objectives (Descriptive Analytics Focus)
This platform answers core historical business questions:
1. **What happened in the business?** (48-month chronological sales trajectory from 2015 to 2018).
2. **How much revenue was generated?** (Sum of total sales: **$2,261,536.93**).
3. **Which categories performed best?** (Technology 36.6%, Furniture 32.2%, Office Supplies 31.2%).
4. **Which regions generated the most sales?** (West 31.4%, East 29.6%, Central 21.8%, South 17.2%).
5. **Which products generated the highest revenue?** (Top 10 leaderboard led by Canon Copier).
6. **Which customer segments contributed the most?** (Consumer 50.8%, Corporate 30.4%, Home Office 18.8%).
7. **Which shipping modes were most frequently used?** (Standard Class 59.8%, Second Class 19.4%, First Class 15.3%, Same Day 5.5%).

> **Non-Goal Notice**: In strict alignment with descriptive analytics best practices, this platform does not implement predictive models, machine learning, AI, or speculative forecasting.

---

## 3. Authentication & Password Security Standards

- **Bcrypt Password Hashing**: Passwords are cryptographically salted and hashed using **bcrypt** (10 salt rounds).
- **Zero Plain-Text Storage**: Passwords are never stored in plain text or using reversible two-way encryption.
- **Backend-Only Storage**: User records reside in `backend/data/users.json`, completely isolated outside the publicly accessible frontend directory.
- **Safe Sanitization**: Password hashes are never exposed through API responses or sessions.
- **Session Management**: Implemented using `express-session` with **HTTP-only cookies** (`superstore.sid`) to mitigate Cross-Site Scripting (XSS).
- **Route Protection**: Direct requests to `/business dashboard.html`, `/sales-analysis`, `/orders`, `/products`, `/reports`, `/profile`, `/settings` without a session automatically redirect to `/login.html?redirect=...`.
- **Profile & Credential Management**: Authenticated users can edit their full name (`PUT /api/auth/profile`) and update their password (`PUT /api/auth/password`).

---

## 4. Light & Dark Mode Theme Engine

- **Default Theme**: Light Mode.
- **Theme Toggle**: Accessible button with inline SVG icons (`icon-moon` / `icon-sun`) in top navigation of Homepage, Login, Registration, and Dashboard.
- **Theme Persistence**: Preserved in browser `localStorage`.
- **FOUC Prevention**: Pre-render `<head>` script prevents flashes of unstyled content.
- **Chart.js Reactivity**: Grid lines, tick labels, and doughnut chart borders dynamically re-colorize upon theme toggle to maintain optimal contrast and legibility.

---

## 5. Dataset Details & Integrity Standards

- **Source**: Kaggle Sample Superstore Dataset.
- **Total Records**: **9,800 transaction records**.
- **Total Columns**: **18 attributes**.
- **Duplicate Records**: **0** (verified zero duplicate records).
- **Temporal Range**: **January 3, 2015 – December 30, 2018** (4 full calendar years).
- **Missing Value Handling**: Exactly **11 records** in the dataset possess missing Postal Code values, all located in **Burlington, Vermont**. Rather than dropping valid transactions, these records are safely handled by assigning `'N/A'`, preserving 100% of the sales volume ($2,261,536.93).
- **Date Format**: Original dates are in `DD/MM/YYYY` format and normalized to standard ISO `YYYY-MM-DD`.

### Dataset Columns (18 Total)
1. `Row ID` | 2. `Order ID` | 3. `Order Date` | 4. `Ship Date` | 5. `Ship Mode` | 6. `Customer ID`
7. `Customer Name` | 8. `Segment` | 9. `Country` | 10. `City` | 11. `State` | 12. `Postal Code`
13. `Region` | 14. `Product ID` | 15. `Category` | 16. `Sub-Category` | 17. `Product Name` | 18. `Sales`

### Crucial Dataset Boundary
This specific Kaggle Sample Superstore CSV file does **NOT** contain `Profit`, `Discount`, or `Quantity` columns. Per strict data integrity guidelines, **these metrics are neither fabricated nor displayed**.

---

## 6. Technology Stack

### Frontend
- **HTML5**: Semantic document structuring across 4 dedicated pages (`index.html`, `login.html`, `signup.html`, `business dashboard.html`).
- **CSS3**: Modern SaaS design system with CSS Variables for Light & Dark mode, responsive CSS Grid, custom elevation shadows, and `@media print` rules.
- **Vanilla JavaScript (ES6+)**: Zero framework overhead, native asynchronous `fetch()`, tab routing, animated counters, debounced search, and toast manager.
- **Chart.js 4.4.1**: Interactive data visualization library rendering charts on HTML5 `<canvas>`.

### Backend
- **Node.js**: Asynchronous event-driven runtime environment.
- **Express.js**: Fast, minimalist web framework serving REST API endpoints and hosting static frontend assets.
- **bcryptjs**: Pure JavaScript implementation of bcrypt password hashing.
- **express-session**: Secure session middleware with HTTP-only cookies.
- **csv-parser**: High-speed streaming CSV parser.
- **cors**: Cross-Origin Resource Sharing middleware.

---

## 7. Folder Structure

```
Business Dashboard Development/
│
├── frontend/
│   └── public/
│       ├── index.html                # Product landing homepage
│       ├── login.html                # User login with show/hide password
│       ├── signup.html               # Registration page (default: Ayush Raj)
│       ├── business dashboard.html   # Protected interactive analytics dashboard
│       ├── css/
│       │   └── styles.css            # Enterprise styling, Light & Dark themes, print rules
│       └── js/
│           └── app.js                # Frontend logic, Chart.js managers, tabs, toasts & auth sync
│
├── backend/
│   ├── data/
│   │   ├── superstore.csv            # Kaggle Superstore dataset (9,800 records)
│   │   └── users.json                # Secure user store (bcrypt password hashes)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── analyticsController.js# Descriptive analytics & CSV export handlers
│   │   │   └── authController.js     # Register, Login, Logout, Profile & Password handlers
│   │   ├── routes/
│   │   │   ├── analyticsRoutes.js    # Express REST API routes for analytics
│   │   │   └── authRoutes.js         # Authentication routes (/api/auth)
│   │   ├── services/
│   │   │   └── analyticsService.js   # Descriptive analytics aggregation logic
│   │   └── utils/
│   │       ├── csvLoader.js          # CSV streaming & memory cache
│   │       ├── dataValidator.js      # Schema validation & date normalization
│   │       └── userStore.js          # Bcrypt hashing & credential persistence
│   ├── package.json                  # Backend dependencies & script definitions
│   └── server.js                     # Server entry point, sessions & route protection
│
├── frontend.md                       # Comprehensive frontend documentation
├── backend.md                        # Comprehensive backend documentation
├── README.md                         # Project overview, installation & user guide
└── package.json                      # Root configuration for seamless single-command run
```

---

## 8. Installation Instructions

### Prerequisites
- **Node.js** (v16.0.0 or higher recommended, tested on Node v25.8.1).
- **npm** (v8.0.0 or higher).

### Step-by-Step Installation
Open your terminal (PowerShell or Command Prompt) and navigate to the project directory:

```powershell
cd "D:\antigravity\project 1\Business Dashboard Development"
npm install
```

---

## 9. Startup Commands

To start the unified server hosting both backend APIs and frontend web pages, run:

```powershell
npm start
```

Upon launching, the terminal displays the active configuration:

```text
===============================================================
🌟 SUPERSTORE BUSINESS PERFORMANCE & SALES ANALYTICS DASHBOARD
===============================================================
🌐 Server Running On:     http://localhost:3000
🏠 Homepage:              http://localhost:3000/
🔐 Login Page:            http://localhost:3000/login.html
📝 Sign Up Page:          http://localhost:3000/signup.html
📊 Analytics Dashboard:   http://localhost:3000/business%20dashboard.html
🩺 Health API Check:      http://localhost:3000/api/health
📦 Processed Records:     9800 records from superstore.csv
⚠️  Missing Postal Codes:  11 (handled safely)
📅 Dataset Date Span:     2015-01-03 to 2018-12-30
===============================================================
```

---

## 10. Localhost URLs

- **Website Homepage**: [http://localhost:3000/](http://localhost:3000/)
- **User Login**: [http://localhost:3000/login.html](http://localhost:3000/login.html)
- **Account Registration**: [http://localhost:3000/signup.html](http://localhost:3000/signup.html)
- **Interactive Analytics Dashboard**: [http://localhost:3000/business%20dashboard.html](http://localhost:3000/business%20dashboard.html) *(Requires login)*
- **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 11. REST API Overview

### Authentication Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Registers a new account with bcrypt password hashing |
| `/api/auth/login` | POST | Authenticates user credentials and issues session cookie |
| `/api/auth/logout` | POST | Destroys current session and clears session cookie |
| `/api/auth/me` | GET | Returns current user session state |
| `/api/auth/profile` | PUT | Updates user's display name |
| `/api/auth/password` | PUT | Changes user's password securely |

### Descriptive Analytics Endpoints
*(Supports query parameters: `startDate`, `endDate`, `region`, `category`, `segment`, `shipMode`)*
| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | System uptime, dataset load status, and record count |
| `/api/analytics/summary` | GET | Returns 5 executive KPI card metrics |
| `/api/analytics/monthly-sales` | GET | Chronological 48-month sales trend |
| `/api/analytics/category-sales` | GET | Sales distribution across Technology, Furniture, Office Supplies |
| `/api/analytics/subcategory-sales`| GET | Sales breakdown across all 17 sub-categories |
| `/api/analytics/region-sales` | GET | Sales distribution across West, East, Central, and South |
| `/api/analytics/segment-sales` | GET | Sales across Consumer, Corporate, and Home Office |
| `/api/analytics/top-products` | GET | Leaderboard of top products by revenue (supports `?limit=10`) |
| `/api/analytics/top-states` | GET | Leaderboard of top states by revenue (supports `?limit=10`) |
| `/api/analytics/shipping-modes`| GET | Order distribution across shipping logistics options |
| `/api/analytics/orders` | GET | Paginated table records (supports `page`, `limit`, `search`, `sortBy`, `sortOrder`) |
| `/api/analytics/recent-orders` | GET | Returns 5-10 most recent orders for quick preview |
| `/api/analytics/data-quality` | GET | Returns audit specs and Burlington VT missing records list |
| `/api/analytics/export-csv` | GET | Streams filtered transactions as a downloadable CSV |
| `/api/analytics/filters` | GET | Distinct filter values and minimum/maximum date boundaries |

---

## 12. Verification & Testing

The system has been verified using automated end-to-end tests:
- **Route Protection**: Direct GET to `/business dashboard.html` or sub-routes without session responds with `302 Redirect` to `/login.html`.
- **API Security**: Unauthenticated calls to protected analytics endpoints rejected with `401 Unauthorized`.
- **Bcrypt Verification**: Inspected `backend/data/users.json` on disk to verify salted hashes (`$2b$10$...`), confirming zero plain-text storage.
- **Session Lifecycle**: Login generates HTTP-only cookie, grants access to dashboard and APIs, and logout destroys the session immediately.
- **Sub-Views & Tabs**: Seamlessly toggles between Overview, Sales Analysis, Orders, Products, Reports, Profile, and Settings.
- **Quick Date Presets**: Instant filter updating across 2018, 2017, 2016, 2015, and All 4 Years.
- **CSV Export & Printing**: Generates valid CSV downloads and formats clean printable reports.
- **Light & Dark Theme**: Validated instant theme switching across all cards, navigation, forms, and Chart.js charts.
