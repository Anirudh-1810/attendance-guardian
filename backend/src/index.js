const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const semesterRoutes = require('./routes/semesters');
const coursesRoutes = require('./routes/courses');
const classesRoutes = require('./routes/class');
const holidayRoutes = require('./routes/holiday');
const statsRoutes = require('./routes/stats');
const onboardingRoutes = require('./routes/onboarding');

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/class', classesRoutes);
app.use('/api/holiday', holidayRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/onboarding', onboardingRoutes);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
