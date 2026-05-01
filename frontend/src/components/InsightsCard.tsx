'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Activity, IndianRupee, Award } from 'lucide-react';

export default function InsightsCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await apiClient.get('/insights');
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="h-32 bg-slate-100 animate-pulse rounded-2xl"></div>;
  }

  if (error || !data) return null;

  const { totalSpending, topCategory, avgDaily, highestExpense, spendingComparison } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgb(0,0,0,0.04)] flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Spent</p>
            <p className="text-2xl 2xl:text-3xl font-bold text-slate-900">₹{totalSpending?.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl shrink-0">
            <IndianRupee className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        <div className="mt-auto pt-2 border-t border-slate-50">
          <p className="text-xs font-medium text-slate-500">Overall tracking</p>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgb(0,0,0,0.04)] flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Daily</p>
            <p className="text-2xl 2xl:text-3xl font-bold text-slate-900">₹{avgDaily?.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl shrink-0">
            <Activity className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        <div className="mt-auto pt-2 border-t border-slate-50">
          <p className="text-xs font-medium text-slate-500 truncate">Highest: <span className="text-slate-700 font-semibold">₹{highestExpense?.toFixed(2) || '0.00'}</span></p>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgb(0,0,0,0.04)] flex flex-col justify-between overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Top Category</p>
            <p className="text-2xl 2xl:text-3xl font-bold text-slate-900 capitalize truncate" title={topCategory || 'N/A'}>
              {topCategory || 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl shrink-0">
            <Award className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-auto pt-2 border-t border-slate-50">
           <p className="text-xs font-medium text-slate-500 truncate">Most frequent area</p>
        </div>
      </div>
    </div>
  );
}
