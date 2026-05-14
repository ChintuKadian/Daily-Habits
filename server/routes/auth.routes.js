const express = require('express');
const router = express.Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, logoutUser, getMe, changePassword, sendTokenResponse } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const oauthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { success: false, message: 'Too many OAuth attempts' }
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/password', protect, authLimiter, changePassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', oauthLimiter, (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(err.message)}`);
    if (!user) return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(info.message)}`);
    
    // Send cookie and redirect
    const { signToken } = require('../utils/tokenHelper');
    const token = signToken(user._id);
    res.cookie('token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/`);
  })(req, res, next);
});

module.exports = router;
