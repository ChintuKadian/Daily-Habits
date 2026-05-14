const User = require('../models/User');
const { signToken } = require('../utils/tokenHelper');

// Helper to set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
  };
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      totalLifetimePoints: user.totalLifetimePoints,
      dailyScores: user.dailyScores,
      authProvider: user.authProvider
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      authProvider: 'local'
    });

    if (user) {
      sendTokenResponse(user, 201, res);
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');

    if (user && user.authProvider !== 'local') {
      return res.status(400).json({ success: false, message: `Please login using your ${user.authProvider} account.` });
    }

    if (user && (await user.matchPassword(password))) {
      sendTokenResponse(user, 200, res);
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        totalLifetimePoints: user.totalLifetimePoints,
        dailyScores: user.dailyScores,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change Password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both old and new passwords' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    
    if (user.authProvider !== 'local') {
      return res.status(400).json({ success: false, message: 'Cannot change password for OAuth accounts.' });
    }

    if (!(await user.matchPassword(oldPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect old password' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as the old password' });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  changePassword,
  sendTokenResponse
};
