/**
 * Express Server Entry Point
 * Superstore Business Performance & Sales Analytics Dashboard
 * Features: Authentication, Route Protection, In-Memory CSV Analytics & Dynamic Port Binding
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const net = require('net');
const session = require('express-session');
const { loadData, getMetadata } = require('./src/utils/csvLoader');
const { initUserStore } = require('./src/utils/userStore');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

// Path to frontend public directory
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend', 'public');
const INDEX_HTML = path.join(FRONTEND_DIR, 'index.html');
const DASHBOARD_HTML = path.join(FRONTEND_DIR, 'business dashboard.html');
const LOGIN_HTML = path.join(FRONTEND_DIR, 'login.html');
const SIGNUP_HTML = path.join(FRONTEND_DIR, 'signup.html');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server-side Session Management with HTTP-only Cookies
app.use(
  session({
    name: 'superstore.sid',
    secret: 'superstore_analytics_session_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Prevents client-side script access
      secure: false,  // Set to false for standard local HTTP testing
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000 // Default 2 hours
    }
  })
);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Authentication API Routes
app.use('/api/auth', authRoutes);

// Analytics API Routes (Health and Summary are public; others require session)
app.use('/api', (req, res, next) => {
  // Allow health check and summary publicly (used by homepage preview)
  if (req.path === '/health' || req.path === '/analytics/summary' || req.path === '/analytics/data-quality') {
    return next();
  }
  // Detailed analytics endpoints require an authenticated session
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to view detailed analytics.'
    });
  }
  next();
}, analyticsRoutes);

// Explicit Public Page Routes
app.get('/', (req, res) => {
  res.sendFile(INDEX_HTML);
});

app.get('/index.html', (req, res) => {
  res.sendFile(INDEX_HTML);
});

app.get('/login', (req, res) => {
  res.sendFile(LOGIN_HTML);
});

app.get('/login.html', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/business%20dashboard.html');
  }
  res.sendFile(LOGIN_HTML);
});

app.get('/signup', (req, res) => {
  res.sendFile(SIGNUP_HTML);
});

app.get('/signup.html', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/business%20dashboard.html');
  }
  res.sendFile(SIGNUP_HTML);
});

// PROTECTED DASHBOARD & SUB-VIEW ROUTES
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

// Serve static frontend assets (css, js, images)
app.use(express.static(FRONTEND_DIR));

// Fallback 404 / SPA handler
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(INDEX_HTML);
});

/**
 * Checks if a port is available
 * @param {number} port
 * @returns {Promise<boolean>}
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port);
  });
}

/**
 * Finds an available port starting from preferredPort
 * @param {number} preferredPort
 * @returns {Promise<number>}
 */
async function findAvailablePort(preferredPort) {
  let port = preferredPort;
  while (!(await isPortAvailable(port))) {
    console.warn(`[Port Notice] Port ${port} is currently in use. Trying port ${port + 1}...`);
    port++;
  }
  return port;
}

/**
 * Starts the application
 */
async function startServer() {
  try {
    console.log('------------------------------------------------------------');
    console.log('🚀 Initializing Superstore Business Analytics Server...');
    console.log('------------------------------------------------------------');

    // 1. Initialize user database storage
    initUserStore();

    // 2. Load and validate CSV dataset
    await loadData();
    const meta = getMetadata();

    // 3. Determine available port
    const port = await findAvailablePort(DEFAULT_PORT);

    // 4. Start listening
    const server = app.listen(port, () => {
      console.log('===============================================================');
      console.log('🌟 SUPERSTORE BUSINESS PERFORMANCE & SALES ANALYTICS DASHBOARD');
      console.log('===============================================================');
      console.log(`🌐 Server Running On:     http://localhost:${port}`);
      console.log(`🏠 Homepage:              http://localhost:${port}/`);
      console.log(`🔐 Login Page:            http://localhost:${port}/login.html`);
      console.log(`📝 Sign Up Page:          http://localhost:${port}/signup.html`);
      console.log(`📊 Analytics Dashboard:   http://localhost:${port}/business%20dashboard.html`);
      console.log(`🩺 Health API Check:      http://localhost:${port}/api/health`);
      console.log(`📦 Processed Records:     ${meta.validRecords} records from superstore.csv`);
      console.log(`⚠️  Missing Postal Codes:  ${meta.missingPostalCodes} (handled safely)`);
      console.log(`📅 Dataset Date Span:     ${meta.minDate} to ${meta.maxDate}`);
      console.log('===============================================================');
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] Closed.');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start application server:');
    console.error(error.message);
    process.exit(1);
  }
}

// Start server if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
