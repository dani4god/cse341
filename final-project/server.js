const express = require('express');
const session = require('express-session');
const passport = require('./config/oauth');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// CRITICAL: Trust proxy for Render
app.set('trust proxy', 1);

app.use(express.json());

// Session configuration for Render
app.use(session({
  secret: process.env.SESSION_SECRET || 'shopsphere2024secretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,     // MUST be false for Render
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Auth Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Force session save before redirect
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/profile');
    });
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

// Profile route
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// Check auth route
app.get('/check-auth', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    hasSession: !!req.session
  });
});

// Your API routes
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));
app.use('/users', require('./routes/users'));
app.use('/reviews', require('./routes/reviews'));

// Home route
app.get('/', (req, res) => {
  res.send(`
    <h2>ShopSphere Online Store API</h2>
    ${req.isAuthenticated() ? 
      `<p>✅ Welcome, ${req.user.displayName}! <a href="/auth/logout">Logout</a> | <a href="/profile">Profile</a></p>` :
      `<p><a href="/auth/github">🔐 Login with GitHub</a></p>`
    }
    <p><a href="/api-docs">📚 API Docs</a> | <a href="/check-auth">🔍 Check Auth</a></p>
    <hr>
    <p><small>Session ID: ${req.sessionID || 'none'}</small></p>
  `);
});

// Start server
mongodb.initDb((err) => {
  if (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  } else {
    app.listen(port, () => {
      console.log(`\n🚀 Server running on port ${port}`);
      console.log(`🔗 https://cse341-final-4ubm.onrender.com\n`);
      console.log(`Session config: secure=false, proxy trust enabled`);
    });
  }
});