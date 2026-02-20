const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Get classes for a subject
router.get('/', async (req, res) => {
  try {
    const { subjectId, startDate, endDate } = req.query;

    const where = { subjectId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const classes = await prisma.class.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { subject: true },
    });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get classes for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { semesterId } = req.query;

    const classes = await prisma.class.findMany({
      where: {
        date: new Date(date),
        subject: {
          semesterId,
        },
      },
      include: {
        subject: true,
      },
      orderBy: { startTime: 'asc' },
    });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark attendance for a class
router.patch('/:id/attendance', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes }),
      },
    });

    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk mark attendance
router.post('/bulk-attendance', async (req, res) => {
  try {
    const { updates } = req.body; // [{ id, status, notes }]

    // Group updates by status for batch updateMany calls
    const statusGroups = {};
    for (const { id, status } of updates) {
      if (!statusGroups[status]) statusGroups[status] = [];
      statusGroups[status].push(id);
    }

    const operations = Object.entries(statusGroups).map(([status, ids]) =>
      prisma.class.updateMany({
        where: { id: { in: ids } },
        data: { status },
      })
    );

    const results = await prisma.$transaction(operations);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a single class
router.post('/', async (req, res) => {
  try {
    const { subjectId, date, dayOfWeek, startTime, endTime, status, notes } = req.body;

    const classEntry = await prisma.class.create({
      data: {
        subjectId,
        date: new Date(date),
        dayOfWeek,
        startTime,
        endTime,
        status: status || 'SCHEDULED',
        notes,
      },
    });

    res.status(201).json(classEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk create classes (for initial setup or past attendance)
router.post('/bulk', async (req, res) => {
  try {
    const { classes } = req.body;

    const result = await prisma.class.createMany({
      data: classes.map(cls => ({
        subjectId: cls.subjectId,
        date: new Date(cls.date),
        dayOfWeek: cls.dayOfWeek,
        startTime: cls.startTime,
        endTime: cls.endTime,
        status: cls.status || 'SCHEDULED',
        notes: cls.notes,
      })),
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a class
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, dayOfWeek, startTime, endTime, status, notes } = req.body;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(dayOfWeek && { dayOfWeek }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a class
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.class.delete({ where: { id } });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark attendance by date (Adhoc or Scheduled)
const classController = require('../controllers/classController');
router.post('/mark-date', classController.markSubjectAttendanceDate);

module.exports = router;
