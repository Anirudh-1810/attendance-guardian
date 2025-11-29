import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all semesters for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'default-user';
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
router.get('/current', async (req, res) => {
  try {
    const userId = req.query.userId || 'default-user';
    const now = new Date();
    
    const semester = await prisma.semester.findFirst({
      where: {
        userId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        subjects: {
          include: {
            classes: true,
          },
        },
        holidays: true,
      },
    });
    
    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create semester
router.post('/', async (req, res) => {
  try {
    const { name, startDate, endDate, requiredPercentage, userId } = req.body;
    
    const semester = await prisma.semester.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        requiredPercentage: requiredPercentage || 75,
        userId: userId || 'default-user',
      },
    });
    
    res.status(201).json(semester);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update semester
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, requiredPercentage } = req.body;
    
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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.semester.delete({ where: { id } });
    res.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
