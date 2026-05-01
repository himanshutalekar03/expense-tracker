import { Router } from 'express';
import prisma from '../utils/db';
import { updateBudgetSchema } from '../validators';
import { z } from 'zod';

const router = Router();

// GET /api/budget?month=X&year=Y
router.get('/', async (req, res) => {
  try {
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const budget = await prisma.budget.findUnique({
      where: {
        month_year: { month, year },
      },
    });

    res.json(budget || { amount: 0, month, year });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/budget
router.post('/', async (req, res) => {
  try {
    const data = updateBudgetSchema.parse(req.body);

    const budget = await prisma.budget.upsert({
      where: {
        month_year: { month: data.month, year: data.year },
      },
      update: {
        amount: data.amount,
      },
      create: {
        amount: data.amount,
        month: data.month,
        year: data.year,
      },
    });

    res.status(200).json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
