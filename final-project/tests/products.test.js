const request = require('supertest');
const express = require('express');
const { ObjectId } = require('mongodb');
const { initDb, getDb } = require('../db/connect');

const app = express();
app.use(express.json());
app.use('/products', require('../routes/products'));

describe('Products API Tests', () => {
  beforeAll((done) => {
    initDb((err) => {
      if (err) {
        console.error('Database connection error:', err);
        done(err);
      }
      done();
    });
  });

  test('GET /products should return 200 and array', async () => {
    const response = await request(app).get('/products');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /products/:id with invalid ID should return 400', async () => {
    const response = await request(app).get('/products/invalid-id');
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid ID format.');
  });

  test('GET /products/:id with non-existent ID should return 404', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app).get(`/products/${fakeId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Product not found.');
  });
});