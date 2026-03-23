const express = require('express');
const router = express.Router();
const passport = require('passport');

// Login with GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/api-docs');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed.' });
    res.redirect('/');
  });
});

// Get current logged in user
router.get('/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not logged in.' });
  }
});

module.exports = router;