# Backend Technical Documentation
## Superstore Business Performance & Sales Analytics Dashboard

This document details the backend architecture, authentication system, password security standards, session handling, data ingestion pipeline, validation standards, descriptive analytics algorithms, and REST API specification for the **Superstore Business Performance & Sales Analytics Dashboard**.

---

## 1. Backend Introduction

The backend is built with **Node.js** and **Express.js**, serving as both a secure authentication provider and a high-throughput descriptive analytics engine. It ingests the raw **Kaggle Sample Superstore CSV dataset**, parses and validates 9,800 transactional records at server initialization, computes in-memory business metrics with sub-millisecond latency, protects dashboard access with bcrypt-hashed credentials and server-side sessions, and exposes specialized REST API endpoints.

### Core Architecture Highlights
- **Framework**: Express.js 4.x
- **Authentication**: Bcrypt-hashed password storage (`bcryptjs`, 10 rounds) + `express-session`
- **Session Security**: HTTP-only cookie (`superstore.sid`), sameSite protection, configurable duration (2 hours or 30 days)
- **Route Protection**: Unauthenticated dashboard and sub-view requests redirect to `/login.html?redirect=...`; protected APIs return HTTP 401
- **Data Source**: Physical CSV file (`backend/data/superstore.csv`)
- **Parsing**: High-throughput streaming via `csv-parser`
- **Memory Strategy**: In-memory dataset cache for instantaneous aggregations
- **Port Conflict Safeguard**: Automated port detection starting from port 3000, dynamically shifting to next available port if occupied
- **Scope**: Exclusively **Descriptive Analytics**; strictly omitting predictive modeling, AI, and any calculation of Profit, Discount, or Quantity.

---

## 2. Backend Folder Structure

```
backend/
├── data/
│   ├── superstore.csv            # Kaggle Sample Superstore dataset (9,800 records)
│   └── users.json                # Backend-only secure user store (bcrypt password hashes)
├── src/
│   ├── controllers/
│   │   ├── analyticsController.js # Analytics HTTP handlers & CSV export orchestration
│   │   └── authController.js      # Register, Login, Logout, Profile & Password controllers
│   ├── routes/
│   │   ├── analyticsRoutes.js     # Router for analytics endpoints
│   │   └── authRoutes.js          # Router for /api/auth endpoints
│   ├── services/
│   │   └── analyticsService.js    # Pure descriptive calculation & aggregation logic
│   └── utils/
│       ├── csvLoader.js           # CSV streaming, memory caching & metadata provider
│       ├── dataValidator.js       # Header validation, date parsing & missing data handling
│       └── userStore.js           # Bcrypt hashing, user lookup, profile update & password change
├── package.json                  # Backend dependencies & scripts
└── server.js                      # Application server entry point, sessions & routes
```

---

## 3. Authentication & Password Security Architecture

### Strict Security Rules
1. **Zero Plain-Text Passwords**: Plain-text passwords are never persisted to disk, logged, or retained in memory.
2. **Zero Reversible Encryption**: Passwords are never encrypted with two-way keys. Irreversible, cryptographically salted one-way hashing with **bcrypt** (10 salt rounds) is enforced.
3. **Backend-Only Storage**: User data is saved in `backend/data/users.json`, completely isolated outside the publicly served `frontend/public/` directory.
4. **No Hash Exposure**: User sanitization (`sanitizeUser()`) explicitly strips `passwordHash` before any user object is attached to sessions or returned in API responses.
5. **No Hardcoded Passwords**: The system contains no default passwords; every user registers their own credentials.

### `userStore.js` Implementation
```javascript
// Password Hashing via bcrypt
const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Password Verification
const isMatch = await bcrypt.compare(password, user.passwordHash);
```

### Session Handling (`server.js`)
Server-side sessions are managed via `express-session`:
```javascript
app.use(session({
  name: 'superstore.sid',
  secret: 'superstore_analytics_session_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,  // Prevents XSS script access
    secure: false,   // Set false for local HTTP development
    sameSite: 'lax',
    maxAge: 2 * 60 * 60 * 1000 // 2 hours (extended to 30 days if Remember Me is checked)
  }
}));
```

---

## 4. Route Protection Middleware

The Express server enforces route access controls across all dashboard entry points:

### HTML Page & Sub-Route Protection
```javascript
const PROTECTED_ROUTES = [
  '/business dashboard.html',
  '/business%20dashboard.html',
  '/dashboard',
  '/sales-analysis',
  '/sales-analysis.html',
  '/orders',
  '/orders.html',
  '/products',
  '/products.html',
  '/reports',
  '/reports.html',
  '/profile',
  '/profile.html',
  '/settings',
  '/settings.html'
];

app.get(PROTECTED_ROUTES, (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect(`/login.html?redirect=${encodeURIComponent(req.originalUrl)}`);
  }
  res.sendFile(DASHBOARD_HTML);
});
```

### API Protection
Endpoints under `/api/analytics/*` (except public health check and summary preview) verify `req.session.user`. Unauthenticated requests immediately receive HTTP 401:
```json
{
  "success": false,
  "message": "Authentication required. Please log in to view detailed analytics."
}
```

---

## 5. Authentication API Endpoints

### 1. `POST /api/auth/register`
Creates a new user account with bcrypt password hashing.

### 2. `POST /api/auth/login`
Authenticates an existing user and sets `superstore.sid` HTTP-only session cookie.

### 3. `POST /api/auth/logout`
Destroys server-side session and clears the session cookie.

### 4. `GET /api/auth/me`
Returns current session authentication state:
```json
{
  "authenticated": true,
  "user": { "id": "usr_...", "fullName": "Ayush Raj", "username": "ayush" }
}
```

### 5. `PUT /api/auth/profile`
Updates current user's full name and syncs active session.

### 6. `PUT /api/auth/password`
Verifies current password with bcrypt, validates new password confirmation, and updates hash on disk.

---

## 6. CSV Data Ingestion & Validation

- **Location**: `backend/data/superstore.csv`.
- **Ingestion**: Streamed line-by-line using `csv-parser` at server boot.
- **Validation**: Headers verified against mandatory 18 columns.
- **Missing Value Handling**: 11 records in Burlington, Vermont with missing postal codes are safely assigned `'N/A'`, preserving 100% of sales volume ($2,261,536.93).
- **Date Normalization**: Dates parsed from `DD/MM/YYYY` into ISO `YYYY-MM-DD` and UTC timestamps.
- **Sales Normalization**: Converted to floats rounded to 2 decimal places.

---

## 7. Descriptive Calculation Algorithms (`analyticsService.js`)

All analytics are purely descriptive and derived directly from the loaded records:

### 1. KPI Summary
- **Total Sales**: $\sum \text{sales}_i$ (\$2,261,536.93)
- **Total Orders**: $\text{Count}(\text{Unique } \text{Order ID})$ (4,922)
- **Total Customers**: $\text{Count}(\text{Unique } \text{Customer ID})$ (793)
- **Total Products**: $\text{Count}(\text{Unique } \text{Product ID})$ (1,861)
- **Average Order Value (AOV)**: $\frac{\text{Total Sales}}{\text{Total Distinct Orders}}$ (\$459.48)

### 2. Visual Aggregations & Reports
- **Monthly Sales Trend**: Aggregated by `YYYY-MM` across 48 months.
- **Category Breakdown**: Technology (36.6%), Furniture (32.2%), Office Supplies (31.2%).
- **Sub-Category Breakdown**: 17 merchandise sub-categories sorted descending.
- **Region Breakdown**: West, East, Central, South.
- **Segment Breakdown**: Consumer (50.8%), Corporate (30.4%), Home Office (18.8%).
- **Top 10 Products by Sales**: Horizontal ranking led by Canon Copier (\$61,599.83).
- **Top 10 States by Sales**: California (\$446k), New York (\$306k), Texas (\$168k), etc.
- **Shipping Modes**: Standard Class (59.8%), Second Class (19.4%), First Class (15.3%), Same Day (5.5%).
- **Recent Orders**: Retrieves latest 5-10 processed transactions.
- **Data Quality Audit**: Details Burlington VT records with missing postal codes.
- **CSV Export**: Dynamically formats active filtered records as RFC 4180 compliant CSV stream.

---

## 8. Startup Instructions

From the project root:

```bash
# 1. Install dependencies
npm install

# 2. Start application
npm start
```

Default access URL: `http://localhost:3000`
Dashboard access URL: `http://localhost:3000/business%20dashboard.html`
