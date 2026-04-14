const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews');
const { isAuthenticated } = require('../middleware/auth');

// Public routes (GET)
router.get('/', reviewsController.getAllReviews);
router.get('/:id', reviewsController.getReviewById);

// Protected routes (POST, PUT, DELETE)
router.post('/', isAuthenticated, reviewsController.createReview);
router.put('/:id', isAuthenticated, reviewsController.updateReview);
router.delete('/:id', isAuthenticated, reviewsController.deleteReview);

module.exports = router;