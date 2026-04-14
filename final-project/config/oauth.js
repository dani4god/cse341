const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { ObjectId } = require('mongodb');  // MUST HAVE THIS
const { getDb } = require('../db/connect');

// Serialize user - store ID as string
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user._id);
  done(null, user._id.toString());
});

// Deserialize user - MUST convert string to ObjectId
passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing ID:', id);
    const db = getDb();
    // THIS IS THE KEY FIX - Convert string to ObjectId
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    console.log('Deserialized user:', user?.displayName);
    done(null, user);
  } catch (err) {
    console.error('Deserialize error:', err);
    done(null, null);  // Return null instead of error
  }
});

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'https://cse341-final-4ubm.onrender.com/auth/github/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('GitHub profile:', profile.id);
    const db = getDb();
    const usersCollection = db.collection('users');
    
    let user = await usersCollection.findOne({ authId: profile.id.toString() });
    
    if (!user) {
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