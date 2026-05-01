'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { format } from 'date-fns';
import { Search, Filter, Trash2, Undo } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExpenseList() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', search, category, timeframe],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (timeframe) params.append('timeframe', timeframe);
      const res = await apiClient.get(`/expenses?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expenses/${id}`);
      return id;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['expenses'] });
      const previousExpenses = queryClient.getQueryData<any[]>(['expenses', search, category, timeframe]);
      
      // Optimistically update
      queryClient.setQueryData(['expenses', search, category, timeframe], (old: any) => 
        old?.filter((expense: any) => expense.id !== deletedId)
      );

      return { previousExpenses, deletedId };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(['expenses', search, category, timeframe], context?.previousExpenses);
      toast.error('Failed to delete expense');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
    onSuccess: (deletedId, variables, context) => {
      // Find the deleted expense from previous context to allow Undo
      const deletedExpense = context?.previousExpenses?.find((e: any) => e.id === deletedId);
      if (deletedExpense) {
        toast((t) => (
          <div className="flex items-center gap-4">
            <span>Expense deleted</span>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  // Simple undo implementation: just recreate it
                  await apiClient.post('/expenses', {
                    amount: deletedExpense.amount,
                    category: deletedExpense.category,
                    description: deletedExpense.description,
                    date: deletedExpense.date,
                  });
                  queryClient.invalidateQueries({ queryKey: ['expenses'] });
                  queryClient.invalidateQueries({ queryKey: ['insights'] });
                  toast.success('Undo successful');
                } catch (error) {
                  toast.error('Failed to undo expense deletion');
                }
              }}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
            >
              Undo
            </button>
          </div>
        ));
      }
    }
  });

  const handleExportCSV = () => {
    if (!expenses) return;
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...expenses.map((e: any) => [
        format(new Date(e.date), 'yyyy-MM-dd'),
        `"${e.description.replace(/"/g, '""')}"`,
        e.category,
        e.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgb(0,0,0,0.04)] flex flex-col h-[500px] overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Recent Expenses</h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            />
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow shrink-0"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow shrink-0"
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Bills">Bills</option>
            <option value="General">General</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-transparent rounded-lg text-sm font-medium hover:bg-indigo-100 transition-all duration-200 shrink-0"
          >
            CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : expenses?.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <p className="font-medium text-slate-600">No expenses found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses?.map((expense: any) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all group"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">
                    {expense.description || expense.category}
                  </span>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium text-xs">
                      {expense.category}
                    </span>
                    <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900 text-lg">
                    ₹{expense.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(expense.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
