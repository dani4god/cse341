const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'You must be logged in to access this route.' });
};

router.get('/', isAuthenticated, usersController.getAllUsers);
router.get('/:id', isAuthenticated, usersController.getUserById);
router.post('/', isAuthenticated, usersController.createUser);
router.put('/:id', isAuthenticated, usersController.updateUser);
router.delete('/:id', isAuthenticated, usersController.deleteUser);

module.exports = router;