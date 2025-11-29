import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all subjects for a semester
router.get('/', async (req, res) => {
  try {
    const { semesterId } = req.query;
    
    const subjects = await prisma.subject.findMany({
      where: { semesterId },
      include: {
        classes: {
          orderBy: { date: 'asc' },
        },
      },
    });
    
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single subject with stats
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        classes: {
          orderBy: { date: 'asc' },
        },
        semester: true,
      },
    });
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    // Calculate stats
    const totalClasses = subject.classes.length;
    const attendedClasses = subject.classes.filter(
      c => c.status === 'PRESENT' || c.status === 'DUTY_LEAVE' || c.status === 'MEDICAL_LEAVE'
    ).length;
    const attendance = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
    
    res.json({
      ...subject,
      stats: {
        totalClasses,
        attendedClasses,
        attendance: Math.round(attendance * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create subject
router.post('/', async (req, res) => {
  try {
    const { name, code, teacher, requiredPercentage, semesterId } = req.body;
    
    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        teacher,
        requiredPercentage: requiredPercentage || 75,
        semesterId,
      },
    });
    
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk create subjects (from timetable)
router.post('/bulk', async (req, res) => {
  try {
    const { subjects, semesterId } = req.body;
    
    const created = await prisma.$transaction(
      subjects.map(subject =>
        prisma.subject.create({
          data: {
            name: subject.name,
            code: subject.code,
            teacher: subject.teacher,
            requiredPercentage: subject.requiredPercentage || 75,
            semesterId,
          },
        })
      )
    );
    
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update subject
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, teacher, requiredPercentage } = req.body;
    
    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(teacher && { teacher }),
        ...(requiredPercentage && { requiredPercentage }),
      },
    });
    
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subject
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
