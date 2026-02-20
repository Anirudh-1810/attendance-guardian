const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 30, checkperiod: 0 }); // 30-second TTL, checkperiod 0 to prevent Jest hanging

// Get overall stats for a semester
router.get('/semester/:semesterId', auth, async (req, res) => {
  try {
    const { semesterId } = req.params;

    // Check cache first
    const cacheKey = `stats-${semesterId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    console.time('stats-query');

    // 1. Fetch subjects with only the fields we need (no classes loaded)
    const subjects = await prisma.userCourse.findMany({
      where: { semesterId },
      select: {
        id: true,
        courseName: true,
        courseCode: true,
        requiredPercentage: true,
        _count: {
          select: { classes: true },
        },
      },
    });

    // 2. Get per-status counts via groupBy (single DB query)
    const statusCounts = await prisma.class.groupBy({
      by: ['subjectId', 'status'],
      where: { subject: { semesterId } },
      _count: true,
    });

    console.timeEnd('stats-query');

    // Build a lookup map: subjectId -> { status -> count }
    const countMap = {};
    for (const row of statusCounts) {
      if (!countMap[row.subjectId]) countMap[row.subjectId] = {};
      countMap[row.subjectId][row.status] = row._count;
    }

    const stats = subjects.map(subject => {
      const totalClasses = subject._count.classes;
      const counts = countMap[subject.id] || {};

      const attendedClasses =
        (counts['PRESENT'] || 0) +
        (counts['DUTY_LEAVE'] || 0) +
        (counts['MEDICAL_LEAVE'] || 0);
      const absentClasses = counts['ABSENT'] || 0;
      const attendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

      const required = subject.requiredPercentage;
      let canBunk = 0;
      let mustAttend = 0;

      if (attendance >= required) {
        canBunk = Math.floor((attendedClasses - (required / 100) * totalClasses) / (required / 100));
      } else {
        const requiredAttended = Math.ceil((required / 100) * totalClasses);
        mustAttend = requiredAttended - attendedClasses;
      }

      return {
        subjectId: subject.id,
        subjectName: subject.courseName,
        subjectCode: subject.courseCode,
        totalClasses,
        attendedClasses,
        absentClasses,
        attendance: Math.round(attendance * 100) / 100,
        required,
        canBunk: Math.max(0, canBunk),
        mustAttend: Math.max(0, mustAttend),
        status: attendance >= 80 ? 'safe' : attendance >= required ? 'warning' : attendance >= required - 5 ? 'high' : 'critical',
      };
    });

    const overallStats = {
      totalSubjects: subjects.length,
      totalClasses: stats.reduce((sum, s) => sum + s.totalClasses, 0),
      totalAttended: stats.reduce((sum, s) => sum + s.attendedClasses, 0),
      totalAbsent: stats.reduce((sum, s) => sum + s.absentClasses, 0),
      averageAttendance: stats.length > 0
        ? Math.round((stats.reduce((sum, s) => sum + s.attendance, 0) / stats.length) * 100) / 100
        : 0,
      subjectsAtRisk: stats.filter(s => s.status === 'high' || s.status === 'critical').length,
    };

    const result = {
      overall: overallStats,
      subjects: stats,
    };

    // Cache the result
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance trend for a subject
router.get('/subject/:subjectId/trend', auth, async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Only select the fields needed for trend computation
    const classes = await prisma.class.findMany({
      where: { subjectId },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        status: true,
      },
    });

    let runningAttended = 0;
    let runningTotal = 0;

    const trend = classes.map(cls => {
      runningTotal++;
      if (cls.status === 'PRESENT' || cls.status === 'DUTY_LEAVE' || cls.status === 'MEDICAL_LEAVE') {
        runningAttended++;
      }

      return {
        date: cls.date,
        attendance: runningTotal > 0 ? (runningAttended / runningTotal) * 100 : 0,
        status: cls.status,
      };
    });

    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
