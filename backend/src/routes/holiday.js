import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all holidays for a semester
router.get('/', async (req, res) => {
  try {
    const { semesterId } = req.query;
    
    const holidays = await prisma.holiday.findMany({
      where: { semesterId },
      orderBy: { date: 'asc' },
    });
    
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a holiday
router.post('/', async (req, res) => {
  try {
    const { date, name, type, semesterId } = req.body;
    
    const holiday = await prisma.holiday.create({
      data: {
        date: new Date(date),
        name,
        type: type || 'HOLIDAY',
        semesterId,
      },
    });
    
    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk create holidays
router.post('/bulk', async (req, res) => {
  try {
    const { holidays } = req.body;
    
    const created = await prisma.$transaction(
      holidays.map(holiday =>
        prisma.holiday.create({
          data: {
            date: new Date(holiday.date),
            name: holiday.name,
            type: holiday.type || 'HOLIDAY',
            semesterId: holiday.semesterId,
          },
        })
      )
    );
    
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a holiday
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.holiday.delete({ where: { id } });
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
