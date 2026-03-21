const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const semesterRoutes = require('./routes/semesters');
const coursesRoutes = require('./routes/courses');
const classesRoutes = require('./routes/class');
const holidayRoutes = require('./routes/holiday');
const statsRoutes = require('./routes/stats');
const onboardingRoutes = require('./routes/onboarding');

const app = express();
app.set('trust proxy', 1);

// Security headers
app.use(helmet());
app.use(cors());
app.use(express.json());

// routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/class', classesRoutes);
app.use('/api/holiday', holidayRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/onboarding', onboardingRoutes);

// 404 handler
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

const PORT = process.env.PORT || 4000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
