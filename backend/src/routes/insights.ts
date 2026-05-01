import { Router } from 'express';
import prisma from '../utils/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany();
    
    // Total Spending
    const totalSpending = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    const pieChartData = Object.keys(categoryBreakdown).map(key => ({
      name: key,
      value: categoryBreakdown[key],
    }));

    // Top Category
    let topCategory = '';
    let maxSpent = 0;
    for (const [cat, amt] of Object.entries(categoryBreakdown)) {
      if ((amt as number) > maxSpent) {
        maxSpent = amt as number;
        topCategory = cat;
      }
    }

    // Average daily spending (assuming over the recorded days)
    const dates = expenses.map(e => new Date(e.date).toDateString());
    const uniqueDays = new Set(dates).size;
    const avgDaily = uniqueDays > 0 ? totalSpending / uniqueDays : 0;

    // Weekly distribution (last 7 days grouped)
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - i);
      return d.toDateString();
    }).reverse();

    const barChartData = last7Days.map(dateStr => {
      const dayTotal = expenses
        .filter(e => new Date(e.date).toDateString() === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        date: dateStr.split(' ')[0] + ' ' + dateStr.split(' ')[2], // e.g., 'Mon 14'
        amount: dayTotal,
      };
    });

    // Highest Expense
    const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;

    // Spending Comparison (This Week vs Last Week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeekSpending = expenses
      .filter(e => new Date(e.date) >= oneWeekAgo)
      .reduce((sum, e) => sum + e.amount, 0);

    const lastWeekSpending = expenses
      .filter(e => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < oneWeekAgo)
      .reduce((sum, e) => sum + e.amount, 0);

    let spendingComparison = 0;
    if (lastWeekSpending > 0) {
      spendingComparison = ((thisWeekSpending - lastWeekSpending) / lastWeekSpending) * 100;
    } else if (thisWeekSpending > 0) {
      spendingComparison = 100;
    }

    res.json({
      totalSpending,
      pieChartData,
      topCategory,
      avgDaily,
      barChartData,
      highestExpense,
      spendingComparison
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
