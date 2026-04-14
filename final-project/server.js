const express = require('express');
const session = require('express-session');
const passport = require('./config/oauth');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Session middleware 
app.use(session({
  secret: process.env.SESSION_SECRET || 'shopsphere2024secretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,     
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  },
  proxy: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));
app.use('/users', require('./routes/users'));
app.use('/reviews', require('./routes/reviews'));

// Auth Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.redirect('/');
  });
});

// Profile route
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h2>ShopSphere Online Store API</h2>
    ${req.isAuthenticated() ? 
      `<p>Welcome, ${req.user.displayName}! <a href="/auth/logout">Logout</a> | <a href="/profile">Profile</a></p>` :
      `<p><a href="/auth/github">Login with GitHub</a></p>`
    }
    <p><a href="/api-docs">Go to API Documentation</a></p>
  `);
});

console.log('Session secret exists:', !!process.env.SESSION_SECRET);
console.log('GitHub Client ID exists:', !!process.env.GITHUB_CLIENT_ID);

mongodb.initDb((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  } else {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API Docs available at http://localhost:${port}/api-docs`);
    });
  }
});