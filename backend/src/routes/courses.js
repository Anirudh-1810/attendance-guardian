const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /courses  (add a course for a semester)
router.post('/', auth, async (req, res) => {
  try {
    const {
      semesterId,
      courseCode,
      courseName,
      teacher,
      totalClassesConducted,
      totalClassesAttended,
      classesPerWeek,
      maxAllowedAbsences,
      medicalLeavesAllowed,
      dutyLeavesAllowed
    } = req.body;

    // Optional: ensure semester belongs to current user
    const semester = await prisma.semester.findFirst({
      where: { id: semesterId, userId: req.user.userId },
    });

    if (!semester) {
      return res.status(403).json({ message: 'Semester not found or not yours' });
    }

    const course = await prisma.userCourse.create({
      data: {
        semesterId,
        courseCode,
        courseName,
        teacher,
        totalClassesConducted: totalClassesConducted ?? 0,
        totalClassesAttended: totalClassesAttended ?? 0,
        classesPerWeek,
        maxAllowedAbsences,
        medicalLeavesAllowed: medicalLeavesAllowed ?? 0,
        dutyLeavesAllowed: dutyLeavesAllowed ?? 0,
      },
    });

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create course' });
  }
});

// GET /courses/:semesterId  (list courses with percentage)
router.get('/:semesterId', auth, async (req, res) => {
  try {
    const { semesterId } = req.params;

    // verify semester belongs to user
    const semester = await prisma.semester.findFirst({
      where: { id: semesterId, userId: req.user.userId },
    });

    if (!semester) {
      return res.status(403).json({ message: 'Semester not found or not yours' });
    }

    const courses = await prisma.userCourse.findMany({
      where: { semesterId },
      orderBy: { createdAt: 'asc' },
    });

    const withPercent = courses.map((c) => {
      const done = c.totalClassesConducted;
      const attended = c.totalClassesAttended;
      const percent = done === 0 ? 0 : (attended / done) * 100;

      return {
        ...c,
        attendancePercent: Number(percent.toFixed(2)),
      };
    });

    res.json(withPercent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

module.exports = router;
