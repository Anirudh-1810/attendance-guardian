import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get overall stats for a semester
router.get('/semester/:semesterId', async (req, res) => {
  try {
    const { semesterId } = req.params;
    
    const subjects = await prisma.subject.findMany({
      where: { semesterId },
      include: {
        classes: true,
      },
    });
    
    const stats = subjects.map(subject => {
      const totalClasses = subject.classes.length;
      const attendedClasses = subject.classes.filter(
        c => c.status === 'PRESENT' || c.status === 'DUTY_LEAVE' || c.status === 'MEDICAL_LEAVE'
      ).length;
      const absentClasses = subject.classes.filter(c => c.status === 'ABSENT').length;
      const attendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
      
      // Calculate can bunk / must attend
      const required = subject.requiredPercentage;
      let canBunk = 0;
      let mustAttend = 0;
      
      if (attendance >= required) {
        // Calculate how many can bunk
        canBunk = Math.floor((attendedClasses - (required / 100) * totalClasses) / (required / 100));
      } else {
        // Calculate how many must attend
        const requiredAttended = Math.ceil((required / 100) * totalClasses);
        mustAttend = requiredAttended - attendedClasses;
      }
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
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
    
    res.json({
      overall: overallStats,
      subjects: stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance trend for a subject
router.get('/subject/:subjectId/trend', async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const classes = await prisma.class.findMany({
      where: { subjectId },
      orderBy: { date: 'asc' },
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

export default router;
