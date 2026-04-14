const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

const getAllUsers = async (req, res) => {
  try {
    const db = getDb();
    const users = await db.collection('users').find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users.', details: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve user.', details: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { displayName, firstName, lastName, email, role, oauthProvider, authId, createdAt } = req.body;
    if (!displayName || !firstName || !lastName || !email || !role || !oauthProvider || !authId || !createdAt) {
      return res.status(400).json({
        error: 'All fields are required: displayName, firstName, lastName, email, role, oauthProvider, authId, createdAt.'
      });
    }
    const db = getDb();
    const result = await db.collection('users').insertOne({
      displayName, firstName, lastName, email, role, oauthProvider, authId, createdAt
    });
    res.status(201).json({ message: 'User created.', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user.', details: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const { displayName, firstName, lastName, email, role, oauthProvider, authId, createdAt } = req.body;
    if (!displayName || !firstName || !lastName || !email || !role || !oauthProvider || !authId || !createdAt) {
      return res.status(400).json({
        error: 'All fields are required: displayName, firstName, lastName, email, role, oauthProvider, authId, createdAt.'
      });
    }
    const db = getDb();
    const result = await db.collection('users').replaceOne(
      { _id: new ObjectId(id) },
      { displayName, firstName, lastName, email, role, oauthProvider, authId, createdAt }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.', details: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.', details: err.message });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };