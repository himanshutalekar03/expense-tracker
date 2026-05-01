import { z } from 'zod';

export const createExpenseSchema = z.object({
  amount: z.number().nonnegative("Amount must be a non-negative number"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional().default(""),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format. Must be ISO 8601.",
  }),
});

export const updateBudgetSchema = z.object({
  amount: z.number().nonnegative(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});
