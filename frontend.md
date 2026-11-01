# Frontend Technical Documentation
## Superstore Business Performance & Sales Analytics Dashboard

This document provides a comprehensive technical reference for the frontend architecture, design system, authentication workflows, Light/Dark mode theme engine, multi-tab routing, Chart.js visualizations, and asynchronous API integration.

---

## 1. Frontend Introduction

The frontend of the **Superstore Business Performance & Sales Analytics Dashboard** is engineered as a high-performance, responsive single/multi-page web application using pure **HTML5, CSS3, Vanilla JavaScript (ES6+)**, and **Chart.js 4.4.1**.

The frontend comprises four dedicated user interfaces and seven integrated sub-views:
1. **Homepage (`index.html`)**: Marketing, overview, and data governance landing page presenting the business case, dataset profile, features, and technology stack.
2. **Registration Page (`signup.html`)**: Clean, centered authentication card allowing users to register their account with Full Name (default: *Ayush Raj*, editable), Username, Password, and Confirmation.
3. **Login Page (`login.html`)**: Centered authentication card with Username, Password, Show/Hide Password visibility toggle (with clean inline SVGs), and Remember Me option.
4. **Interactive Business Dashboard (`business dashboard.html`)**: Enterprise analytics workspace housing:
   - **Overview Tab (`#view-overview`)**: 5 Animated KPI cards, Monthly Sales Trend line chart, Category and Segment doughnut charts, Recent Transactions snapshot.
   - **Sales Analysis Tab (`#view-sales-analysis`)**: Sub-Category vertical bar chart, Region-wise bar chart, Shipping Mode doughnut chart.
   - **Orders Workbench Tab (`#view-orders`)**: Complete sortable transaction table, debounced live search, customizable rows per page, pagination, and CSV Export.
   - **Products & States Tab (`#view-products`)**: Top 10 Products horizontal bar chart and Top 10 States vertical bar chart.
   - **Reports Center Tab (`#view-reports`)**: Executive Summary report, printable report view (`@media print`), CSV dataset download, and Data Quality certification.
   - **User Profile Tab (`#view-profile`)**: Profile metadata, avatar, edit full name form (`PUT /api/auth/profile`).
   - **System Settings Tab (`#view-settings`)**: Appearance theme preferences, secure change password form (`PUT /api/auth/password`).

No heavyweight client frameworks (such as React, Angular, or Vue) are utilized, ensuring instant page loads, zero build-step overhead, and complete maintainability.

---

## 2. Frontend Folder Structure

The frontend files reside under `frontend/public/` and are served statically by the Express backend:

```
frontend/
└── public/
    ├── index.html                    # Main website landing page
    ├── login.html                    # User login page with show/hide password
    ├── signup.html                   # User registration page (default: Ayush Raj)
    ├── business dashboard.html       # Protected interactive analytics dashboard
    ├── css/
    │   └── styles.css                # Enterprise design system, Light & Dark themes, print layout
    └── js/
        └── app.js                    # Client logic, Chart.js managers, tabs, toasts & auth sync
```

---

## 3. Authentication Pages Architecture

### Sign Up Page (`signup.html`)
- **Full Name Input**: Pre-filled with `Ayush Raj` by default, fully editable.
- **Username Input**: Allows users to choose a unique handle (minimum 3 characters).
- **Password Input**: Secure field with interactive Show/Hide visibility toggle using SVG eye icons.
- **Confirm Password Input**: Matching validation with visibility toggle.
- **Validation**: Client-side checks for empty fields, minimum length, and password confirmation parity before dispatching `POST /api/auth/register`.
- **Theme Reactivity**: Top navigation features the theme switcher button with SVG moon/sun icons.
- **Post-Registration**: Upon successful account creation, establishes the session and redirects straight into `/business dashboard.html`.

### Login Page (`login.html`)
- **Username & Password Fields**: Clean, high-contrast inputs with focus ring styling.
- **Show/Hide Password Option**: Toggle button switching between text and password types with clean SVG eye icons.
- **Remember Me Option**: Checkbox configuring cookie expiration (30 days vs 2 hours).
- **Redirection Logic**: Checks URL query parameter `?redirect=...` to return users to their intended dashboard location after login.
- **Error Feedback**: High-visibility alert banners display server-side rejection reasons (e.g. invalid credentials).

---

## 4. Light & Dark Mode Theme Engine

The application implements a fully functional, zero-latency theme switching system:

### CSS Custom Properties Architecture
Themes are driven by CSS variables defined under `:root` (Light mode, default) and `[data-theme="dark"]` (Dark mode):

```css
:root {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --bg-header: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --input-bg: #ffffff;
}

[data-theme="dark"] {
  --bg-main: #0b0f19;
  --bg-card: #151c2c;
  --bg-header: #151c2c;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #243049;
  --input-bg: #0e1422;
}
```

### Theme Persistence & FOUC Prevention
- User preference is stored in browser `localStorage.getItem('superstore_theme')`.
- An inline script in the `<head>` of every HTML document evaluates the theme before DOM rendering, completely eliminating Flash of Unstyled Content (FOUC).
- Clicking the theme toggle button updates `data-theme`, flips the SVG icon (`icon-moon` / `icon-sun`), saves the preference, and notifies Chart.js to re-render.
- Synchronized with Settings view radio cards.

### Chart.js Theme Adaptation
When switching themes, Chart.js dynamically adapts:
- **Grid Lines**: Switch from light grey (`#f1f5f9`) to dark slate (`#243049`).
- **Axis Labels & Ticks**: Switch from muted grey (`#64748b`) to high-contrast slate (`#94a3b8`).
- **Doughnut Borders**: Border separators adapt from `#ffffff` to dark card tone (`#151c2c`).

---

## 5. Sub-Views & Tab Router System

The main dashboard application includes a client-side tab router synchronizing browser hash locations with active tab containers:

| Sub-View / Tab | Container ID | URL Hash | Key Features |
|---|---|---|---|
| **Overview** | `#view-overview` | `#overview` | Multi-dimensional filter card, 5 Animated KPI cards, Monthly Sales Trend (Line), Category Sales (Doughnut), Segment Sales (Doughnut), Recent Transactions snapshot table. |
| **Sales Analysis** | `#view-sales-analysis` | `#sales-analysis` | Sub-Category Sales (17 merchandise bars), Region-wise Sales (Bar), Shipping Mode Analysis (Doughnut). |
| **Orders Workbench**| `#view-orders` | `#orders` | Searchable, sortable 9-column transactional table, page size selector (10, 15, 25, 50, 100), numeric pagination, and Download Orders CSV button. |
| **Products & States**| `#view-products`| `#products` | Top 10 Products by Revenue (Horizontal Bar) and Top 10 States by Revenue (Vertical Bar). |
| **Reports Center** | `#view-reports` | `#reports` | Executive Performance Summary report, printable layout (`@media print`), Data Quality & Integrity certification, CSV master export. |
| **User Profile** | `#view-profile` | `#profile` | User avatar, account metadata, Edit Full Name form (`PUT /api/auth/profile`). |
| **System Settings**| `#view-settings` | `#settings` | Light/Dark theme selection radio cards, secure Change Password form (`PUT /api/auth/password`). |

---

## 6. Collapsible Sidebar & Mobile Drawer

- **Desktop Collapsible Rail**: Clicking the sidebar collapse button toggles `.collapsed` mode (74px compact rail) with centered icons, persistent in `localStorage`.
- **Mobile Slide-Over Drawer**: For mobile screens (`<= 900px`), the sidebar acts as a slide-over drawer triggered by the hamburger button and dismissible via close button or backdrop click (`#sidebar-backdrop`).

---

## 7. JavaScript Application Logic (`app.js`)

`app.js` runs as an immediately-invoked functional expression (IIFE) in strict mode to prevent global scope pollution.

### Core Modules:
1. **Authentication Session Verification (`checkAuthentication`)**: Queries `GET /api/auth/me`. If unauthorized, redirects to `/login.html?redirect=...`. Populates user name and initials.
2. **Animated KPI Counter (`animateValue`)**: Smooth numeric roll-up transitions using cubic easing on initial load and whenever filters update.
3. **Quick Date Presets Bar**: One-click filters for All 4 Years, 2018, 2017, 2016, and 2015.
4. **Interactive Filters Manager**: Two-way binding for Start Date, End Date, Region, Category, Segment, Ship Mode, Apply, and Reset.
5. **Toast Notification System (`showToast`)**: Non-blocking, animated alert notifications for success, error, warning, and info events.
6. **Confirmation Dialog Modal (`showConfirm`)**: Modal verification for actions such as signing out.
7. **Data Quality Audit Modal**: Displays Burlington VT records with missing postal codes handled safely as `'N/A'`.
8. **CSV File Export**: Initiates streaming export via `GET /api/analytics/export-csv`.
9. **Executive Print Generator**: Prepares report view and triggers `window.print()`.

---

## 8. Chart.js Visualizations (All 8 Charts)

All charts are created using Chart.js v4.4.1 (UMD build). Existing instances are destroyed (`chart.destroy()`) before re-instantiation to eliminate canvas collisions and memory leaks.

| # | Chart Title | Chart Type | Canvas ID | Data Fields | Formatting & Customization |
|---|---|---|---|---|---|
| 1 | **Monthly Sales Trend** | Line | `chart-monthly-sales` | Monthly Sales (`$`), Order Count | Tension: 0.35, gradient fill, tooltip showing both currency sales and total orders |
| 2 | **Category-wise Sales** | Doughnut | `chart-category-sales` | Category Sales, Percentage Share | Cutout: 62%, Technology / Furniture / Office Supplies custom palette |
| 3 | **Customer Segment Analysis** | Doughnut | `chart-segment-sales` | Segment Sales, Share (%) | Consumer (50.8%), Corporate (30.4%), Home Office (18.8%) |
| 4 | **Sub-Category Sales** | Bar (Vertical) | `chart-subcategory-sales` | Sub-category Sales, Parent Category | 17 sub-categories sorted descending |
| 5 | **Region-wise Sales** | Bar (Vertical) | `chart-region-sales` | Region Sales, Percentage | West, East, Central, South |
| 6 | **Shipping Mode Analysis** | Doughnut | `chart-shipping-modes` | Shipment Count, Sales, Share | Standard Class, Second Class, First Class, Same Day |
| 7 | **Top 10 Products by Sales** | Bar (Horizontal) | `chart-top-products` | Product Name, Revenue | `indexAxis: 'y'`, truncated labels with full product names in tooltips |
| 8 | **Top 10 States by Sales** | Bar (Vertical) | `chart-top-states` | State Sales, Order Count | California, New York, Texas, Washington, Pennsylvania, etc. |

---

## 9. Print Layout & Reports Optimization (`@media print`)

The application features dedicated print stylesheet rules:
- Hides sidebars, headers, action buttons, quick preset pills, pagination bars, and modal backdrops.
- Resets background canvas to pure white (`#ffffff`) and sets high-contrast black typography (`#000000`).
- Displays `#view-reports` executive summary report and data quality certificate cleanly for one-click printing or PDF export.
