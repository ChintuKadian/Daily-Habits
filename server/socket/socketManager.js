const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_room', async (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
        await User.findByIdAndUpdate(userId, { socketId: socket.id }).catch(err => console.error(err));
      }
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null }).catch(err => console.error(err));
    });
  });
};
