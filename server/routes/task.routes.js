const express = require('express');
const router = express.Router();
const { getTasks, createTask, completeTask, recoverTask, deleteTask } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .delete(deleteTask);

router.patch('/:id/complete', completeTask);
router.patch('/:id/recover', recoverTask);

module.exports = router;
