const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { isAuthenticated } = require('../middleware/auth');

// Public routes (GET)
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

// Protected routes (POST, PUT, DELETE)
router.post('/', isAuthenticated, usersController.createUser);
router.put('/:id', isAuthenticated, usersController.updateUser);
router.delete('/:id', isAuthenticated, usersController.deleteUser);

module.exports = router;