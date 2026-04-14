const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { getDb } = require('../db/connect');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: id });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const db = getDb();
    const usersCollection = db.collection('users');
    
    // Check if user exists
    let user = await usersCollection.findOne({ authId: profile.id.toString() });
    
    if (!user) {
      // Create new user
      const newUser = {
        displayName: profile.username,
        firstName: profile.displayName?.split(' ')[0] || profile.username,
        lastName: profile.displayName?.split(' ')[1] || '',
        email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
        role: 'customer',
        oauthProvider: 'github',
        authId: profile.id.toString(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;