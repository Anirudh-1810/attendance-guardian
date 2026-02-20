const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all semesters for a user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const semesters = await prisma.semester.findMany({
      where: { userId },
      include: {
        subjects: true,
        holidays: true,
      },
      orderBy: { startDate: 'desc' },
    });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current semester
router.get('/current', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    console.time('semester-current-query');

    // Single query: fetch all semesters with subjects + holidays in one shot
    const allSemesters = await prisma.semester.findMany({
      where: { userId },
      include: {
        subjects: true,
        holidays: true,
      },
      orderBy: { startDate: 'desc' },
    });

    console.timeEnd('semester-current-query');

    let semester = null;

    if (allSemesters.length > 0) {
      // Pick the best semester using smart selection logic
      let activeSemester = null;
      let latestDataSemester = null;

      for (const s of allSemesters) {
        const isActive = new Date(s.startDate) <= now && new Date(s.endDate) >= now;
        if (isActive && !activeSemester) {
          activeSemester = s;
        }
        if (s.subjects.length > 0 && !latestDataSemester) {
          latestDataSemester = s;
        }
      }

      if (activeSemester && activeSemester.subjects.length > 0) {
        semester = activeSemester;
      } else if (latestDataSemester) {
        semester = latestDataSemester;
      } else if (activeSemester) {
        semester = activeSemester;
      } else {
        semester = allSemesters[0];
      }
    }

    // Auto-create if NO semesters exist at all
    if (!semester) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      semester = await prisma.semester.create({
        data: {
          name: "Semester 1",
          startDate,
          endDate,
          requiredPercentage: 75,
          userId
        },
        include: {
          subjects: true,
          holidays: true
        }
      });
    }

    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create semester
router.post('/', auth, async (req, res) => {
  try {
    const { name, startDate, endDate, requiredPercentage } = req.body;
    const userId = req.user.userId;

    const semester = await prisma.semester.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        requiredPercentage: requiredPercentage || 75,
        userId,
      },
    });

    res.status(201).json(semester);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update semester
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, requiredPercentage } = req.body;
    const userId = req.user.userId;

    // Verify ownership
    const existing = await prisma.semester.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Semester not found' });

    const semester = await prisma.semester.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(requiredPercentage && { requiredPercentage }),
      },
    });

    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete semester
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const existing = await prisma.semester.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Semester not found' });

    await prisma.semester.delete({ where: { id } });
    res.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
