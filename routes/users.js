const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'You must be logged in to access this route.' });
};

// GET /users — return all users (protected)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    const users = await db.collection('Users').find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users.', details: err.message });
  }
});

// GET /users/:id — return a single user (protected)
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const user = await db.collection('Users').findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve user.', details: err.message });
  }
});

// POST /users — create a new user (protected)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, role, createdAt } = req.body;
    if (!firstName || !lastName || !email || !phone || !address || !role || !createdAt) {
      return res.status(400).json({
        error: 'All fields are required: firstName, lastName, email, phone, address, role, createdAt.'
      });
    }
    const db = getDb();
    const result = await db.collection('Users').insertOne({
      firstName, lastName, email, phone, address, role, createdAt
    });
    res.status(201).json({ message: 'User created.', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user.', details: err.message });
  }
});

// PUT /users/:id — update a user (protected)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const { firstName, lastName, email, phone, address, role, createdAt } = req.body;
    if (!firstName || !lastName || !email || !phone || !address || !role || !createdAt) {
      return res.status(400).json({
        error: 'All fields are required: firstName, lastName, email, phone, address, role, createdAt.'
      });
    }
    const db = getDb();
    const result = await db.collection('Users').replaceOne(
      { _id: new ObjectId(id) },
      { firstName, lastName, email, phone, address, role, createdAt }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.', details: err.message });
  }
});

// DELETE /users/:id — delete a user (protected)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const result = await db.collection('Users').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.', details: err.message });
  }
});

module.exports = router;