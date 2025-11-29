const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const semesterRoutes = require('./routes/semesters');
const courseRoutes = require('./routes/courses');
// const attendanceRoutes = require('./routes/attendance'); // later

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use('/auth', authRoutes);
app.use('/semesters', semesterRoutes);
app.use('/courses', courseRoutes);
// app.use('/attendance', attendanceRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
