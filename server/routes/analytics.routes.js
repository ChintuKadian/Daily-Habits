const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/').get(protect, getAnalytics);

module.exports = router;
