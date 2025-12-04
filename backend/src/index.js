const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const semesterRoutes = require('./routes/semesters');
const courseRoutes = require('./routes/courses');
const classRoutes = require('./routes/class');
const holidayRoutes = require('./routes/holiday');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/class', classRoutes);
app.use('/api/holiday', holidayRoutes);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
