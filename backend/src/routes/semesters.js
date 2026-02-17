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

    // 1. Fetch ALL semesters for the user to make a smart decision
    const allSemesters = await prisma.semester.findMany({
      where: { userId },
      include: {
        subjects: {
          include: {
            classes: true,
          },
        },
        holidays: true,
      },
      orderBy: { startDate: 'desc' },
    });

    let semester = null;
    let activeSemester = null;
    let latestDataSemester = null;

    // 2. Analyze semesters
    for (const s of allSemesters) {
      // Check if active (date match)
      const isActive = new Date(s.startDate) <= now && new Date(s.endDate) >= now;
      if (isActive && !activeSemester) {
        activeSemester = s;
      }

      // Check for data (has subjects) - prioritize most recent ones (already sorted desc)
      if (s.subjects.length > 0 && !latestDataSemester) {
        latestDataSemester = s;
      }
    }

    // 3. Smart Selection Logic
    // Priority 1: Active semester WITH data
    if (activeSemester && activeSemester.subjects.length > 0) {
      semester = activeSemester;
    }
    // Priority 2: Latest semester WITH data (fallback if active is empty or missing)
    else if (latestDataSemester) {
      semester = latestDataSemester;
    }
    // Priority 3: Active semester (even if empty - maybe they just started it)
    else if (activeSemester) {
      semester = activeSemester;
    }
    // Priority 4: Latest semester (even if empty)
    else if (allSemesters.length > 0) {
      semester = allSemesters[0];
    }

    // 4. Result or Auto-create
    // Only auto-create if NO semesters exist at all
    if (!semester) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // Default 6 months

      semester = await prisma.semester.create({
        data: {
          name: "Semester 1",
          startDate,
          endDate,
          requiredPercentage: 75,
          userId
        },
        include: {
          subjects: { include: { classes: true } },
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
