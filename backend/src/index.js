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
app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/class', classesRoutes);
app.use('/api/holiday', holidayRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/onboarding', onboardingRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
