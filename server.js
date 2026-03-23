const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const mongodb = require('./db/connect');
const MongoStore = require('connect-mongo');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/contacts', require('./routes/contacts'));
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));

// Root route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h2>Welcome, ${req.user.displayName}!</h2>
      <p><a href="/api-docs">Go to API Docs</a></p>
      <p><a href="/auth/logout">Logout</a></p>
    `);
  } else {
    res.send(`
      <h2>Contacts API</h2>
      <p><a href="/auth/github">Login with GitHub</a></p>
      <p><a href="/api-docs">Go to API Docs</a></p>
    `);
  }
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