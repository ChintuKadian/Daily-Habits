const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        if (user.authProvider !== 'google') {
          // Exists but with different provider (e.g., local)
          return done(null, false, { message: 'An account with this email already exists. Please sign in with your password.' });
        }
        return done(null, user);
      }

      // Create new user
      user = await User.create({
        name: profile.displayName || profile.emails[0].value.split('@')[0],
        email: profile.emails[0].value,
        authProvider: 'google',
        authProviderId: profile.id
      });
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

module.exports = passport;
