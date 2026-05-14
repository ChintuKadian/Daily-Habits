const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');

const initCronJobs = (io) => {
  // Run every midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running midnight transition job...');
    try {
      const now = new Date();
      const overdueTasks = await Task.find({
        status: 'pending',
        deadline: { $lt: now }
      });
      
      for (const task of overdueTasks) {
        task.status = 'recovery';
        task.isRecovery = true;
        await task.save();
        
        io.to(task.userId.toString()).emit('task_recovery', {
          taskId: task._id,
          message: `Task "${task.name}" is now in recovery mode.`
        });
      }
      
      console.log(`Transitioned ${overdueTasks.length} tasks to recovery mode.`);
    } catch (error) {
      console.error('Error in midnight transition:', error);
    }
  });
};

module.exports = initCronJobs;
