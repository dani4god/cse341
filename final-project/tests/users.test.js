const request = require('supertest');
const express = require('express');
const { ObjectId } = require('mongodb');
const { initDb } = require('../db/connect');

const app = express();
app.use(express.json());
app.use('/users', require('../routes/users'));

// Mock authentication for tests
jest.mock('../middleware/auth', () => ({
  isAuthenticated: (req, res, next) => next()
}));

describe('Users API Tests', () => {
  beforeAll((done) => {
    initDb((err) => {
      if (err) {
        console.error('Database connection error:', err);
        done(err);
      }
      done();
    });
  });

  test('GET /users should return 200 and array', async () => {
    const response = await request(app).get('/users');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /users/:id with invalid ID should return 400', async () => {
    const response = await request(app).get('/users/invalid-id');
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid ID format.');
  });

  test('GET /users/:id with non-existent ID should return 404', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app).get(`/users/${fakeId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('User not found.');
  });
});