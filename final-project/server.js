const express = require('express');
const session = require('express-session');
const passport = require('./config/oauth');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Session middleware (required for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Auth Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// Routes
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));
app.use('/users', require('./routes/users'));
app.use('/reviews', require('./routes/reviews'));

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h2>ShopSphere Online Store API</h2>
    ${req.isAuthenticated() ? 
      `<p>Welcome, ${req.user.displayName}! <a href="/logout">Logout</a></p>` :
      `<p><a href="/auth/github">Login with GitHub</a></p>`
    }
    <p><a href="/api-docs">Go to API Documentation</a></p>
  `);
});

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