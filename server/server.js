require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketManager = require('./socket/socketManager');
const initCronJobs = require('./jobs/midnightTransition');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const habitRoutes = require('./routes/habit.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Connect to Database
connectDB();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
  }
});

// Pass io instance to app
app.set('io', io);

// Initialize Socket Manager
socketManager(io);

// Initialize Cron Jobs
initCronJobs(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('Daily Habits API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port or change PORT in .env`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
