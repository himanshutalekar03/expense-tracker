'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, queueOfflineRequest } from '@/services/api';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { Sparkles, Plus, Loader2, Calendar } from 'lucide-react';

const expenseSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required').refine((val) => {
    // Prevent future dates (allow today)
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return selectedDate <= today;
  }, { message: 'Date cannot be in the future' }),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpenseForm() {
  const [nlpText, setNlpText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: undefined,
      category: 'General',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      // If we are offline, it will fail, and we can queue it
      const idempotencyKey = uuidv4();
      try {
        const res = await apiClient.post('/expenses', data, {
          headers: { 'Idempotency-Key': idempotencyKey },
        });
        return res.data;
      } catch (err: any) {
        if (!err.response) {
          // Offline
          queueOfflineRequest({
            method: 'post',
            url: '/expenses',
            data,
            headers: { 'Idempotency-Key': idempotencyKey },
          });
          return { ...data, id: `temp-${uuidv4()}` };
        }
        throw err;
      }
    },
    onError: () => {
      toast.error('Failed to add expense');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
    onSuccess: () => {
      toast.success('Expense added');
      reset({
        amount: undefined,
        category: 'General',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setNlpText('');
    },
  });

  const handleNlpSubmit = async () => {
    if (!nlpText) return;
    setIsParsing(true);
    try {
      const res = await apiClient.post('/parse-expense', { text: nlpText });
      const { amount, category, description, date } = res.data;
      if (amount) setValue('amount', amount);
      if (category) setValue('category', category);
      if (description) setValue('description', description);
      if (date) {
        // Ensure parsed date is not in future
        const parsedDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (parsedDate <= today) {
          setValue('date', date.split('T')[0]);
        } else {
          setValue('date', today.toISOString().split('T')[0]);
        }
      }
      toast.success('Parsed from text!');
    } catch (error) {
      toast.error('Failed to parse text');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgb(0,0,0,0.04)] p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Add Expense</h3>

      {/* NLP Input */}
      <div className="mb-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
        <label className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          Smart Add
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={nlpText}
            onChange={(e) => setNlpText(e.target.value)}
            placeholder="e.g., Spent 50 on food yesterday"
            className="flex-1 min-w-0 px-3 py-2.5 bg-white border border-indigo-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder:text-slate-400"
            onKeyDown={(e) => e.key === 'Enter' && handleNlpSubmit()}
          />
          <button
            onClick={handleNlpSubmit}
            disabled={isParsing || !nlpText}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgb(79,70,229,0.25)] hover:shadow-[0_4px_12px_rgb(79,70,229,0.3)]"
          >
            {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Parse'}
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-semibold text-slate-400 tracking-wider">OR MANUAL ENTRY</span>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-xs text-red-500 mt-1 font-medium">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            {...register('category')}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Bills">Bills</option>
            <option value="General">General</option>
          </select>
          {errors.category && <p className="text-xs text-red-500 mt-1 font-medium">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            {...register('description')}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:text-slate-400"
            placeholder="What was this for?"
          />
          {errors.description && <p className="text-xs text-red-500 mt-1 font-medium">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register('date')}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:transition-opacity [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
          {errors.date && <p className="text-xs text-red-500 mt-1 font-medium">{errors.date.message}</p>}
        </div>

        <button
          type="submit"
          disabled={addMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm mt-4"
        >
          {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Expense
        </button>
      </form>
    </div>
  );
}
