const express = require('express');
const { getHabits, createHabit, toggleHabit, deleteHabit } = require('../controllers/habit.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.route('/').get(getHabits).post(createHabit);
router.route('/:id').delete(deleteHabit);
router.patch('/:id/toggle', toggleHabit);

module.exports = router;
