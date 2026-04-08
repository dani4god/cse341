const express = require('express');
const mongodb = require('./db/connect');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h2>ShopSphere Online Store API</h2>
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