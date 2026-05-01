import { Router } from 'express';
import prisma from '../utils/db';
import { createExpenseSchema } from '../validators';
import { z } from 'zod';

const router = Router();

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const { category, search, sortBy = 'date', order = 'desc', timeframe } = req.query;

    const where: any = {};
    if (category) {
      where.category = String(category);
    }
    if (search) {
      where.description = {
        contains: String(search),
      };
    }
    if (timeframe) {
      const now = new Date();
      if (timeframe === 'today') {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        where.date = { gte: startOfDay };
      } else if (timeframe === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);
        where.date = { gte: startOfWeek };
      } else if (timeframe === 'month') {
        const startOfMonth = new Date(now);
        startOfMonth.setDate(now.getDate() - 30);
        startOfMonth.setHours(0, 0, 0, 0);
        where.date = { gte: startOfMonth };
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: {
        [String(sortBy)]: String(order) === 'asc' ? 'asc' : 'desc',
      },
    });

    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

    if (idempotencyKey) {
      const existing = await prisma.expense.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        // Idempotency: Return existing expense if it matches the key
        return res.status(200).json(existing);
      }
    }

    const data = createExpenseSchema.parse(req.body);

    const expense = await prisma.expense.create({
      data: {
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: new Date(data.date),
        idempotencyKey: idempotencyKey ?? null,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
