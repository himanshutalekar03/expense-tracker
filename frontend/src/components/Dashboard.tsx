'use client';

import React from 'react';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';
import InsightsCard from '@/components/InsightsCard';
import Charts from '@/components/Charts';

export default function Dashboard() {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
      {/* Priority Action: Add Expense Form (Top on Mobile/Tablet, Right on Desktop) */}
      <div className="order-1 lg:order-2 space-y-6 lg:col-span-1">
        <div className="lg:sticky lg:top-6 transition-all duration-300">
          <ExpenseForm />
          {/* Budget Alert can go here */}
        </div>
      </div>

      {/* Main Content: Insights, Charts, List (Bottom on Mobile/Tablet, Left on Desktop) */}
      <div className="order-2 lg:order-1 space-y-6 lg:col-span-2">
        <InsightsCard />
        <Charts />
        <ExpenseList />
      </div>
    </div>
  );
}
