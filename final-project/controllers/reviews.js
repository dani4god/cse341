const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

const getAllReviews = async (req, res) => {
  try {
    const db = getDb();
    const reviews = await db.collection('reviews').find().toArray();
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reviews.', details: err.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(id) });
    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve review.', details: err.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { productId, userId, rating, comment, createdAt } = req.body;
    
    // Validation
    if (!productId || !userId || !rating || !comment || !createdAt) {
      return res.status(400).json({
        error: 'All fields are required: productId, userId, rating, comment, createdAt.'
      });
    }
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }
    
    if (!ObjectId.isValid(productId) || !ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid productId or userId format.' });
    }
    
    const db = getDb();
    const result = await db.collection('reviews').insertOne({
      productId: new ObjectId(productId),
      userId: new ObjectId(userId),
      rating,
      comment,
      createdAt
    });
    res.status(201).json({ message: 'Review created.', id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review.', details: err.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    
    const { productId, userId, rating, comment, createdAt } = req.body;
    
    // Validation
    if (!productId || !userId || !rating || !comment || !createdAt) {
      return res.status(400).json({
        error: 'All fields are required: productId, userId, rating, comment, createdAt.'
      });
    }
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }
    
    if (!ObjectId.isValid(productId) || !ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid productId or userId format.' });
    }
    
    const db = getDb();
    const result = await db.collection('reviews').replaceOne(
      { _id: new ObjectId(id) },
      {
        productId: new ObjectId(productId),
        userId: new ObjectId(userId),
        rating,
        comment,
        createdAt
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }
    res.status(200).json({ message: 'Review updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review.', details: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const db = getDb();
    const result = await db.collection('reviews').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Review not found.' });
    }
    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review.', details: err.message });
  }
};

module.exports = { getAllReviews, getReviewById, createReview, updateReview, deleteReview };