import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageExpense } from './parser';

describe('parseNaturalLanguageExpense', () => {
  it('should parse amount correctly', () => {
    const result = parseNaturalLanguageExpense('Spent 500 on petrol today');
    expect(result.amount).toBe(500);
    expect(result.category).toBe('Transport');
  });

  it('should parse decimal amounts', () => {
    const result = parseNaturalLanguageExpense('Bought food for 15.50');
    expect(result.amount).toBe(15.5);
    expect(result.category).toBe('Food');
  });

  it('should handle text with no numbers', () => {
    const result = parseNaturalLanguageExpense('Paid rent');
    expect(result.amount).toBe(0);
    expect(result.category).toBe('Bills');
  });

  it('should default to General category if no keywords match', () => {
    const result = parseNaturalLanguageExpense('Spent 100 on something unknown');
    expect(result.amount).toBe(100);
    expect(result.category).toBe('General');
  });

  it('should parse "yesterday" correctly', () => {
    const result = parseNaturalLanguageExpense('Bought movies for 20 yesterday');
    expect(result.amount).toBe(20);
    expect(result.category).toBe('Entertainment');
    
    const d = new Date();
    d.setDate(d.getDate() - 1);
    // Compare dates (ignoring time components for simpler test)
    expect(new Date(result.date).toDateString()).toBe(d.toDateString());
  });

  it('should parse "last week" correctly', () => {
    const result = parseNaturalLanguageExpense('Uber cost 40 last week');
    expect(result.amount).toBe(40);
    expect(result.category).toBe('Transport');
    
    const d = new Date();
    d.setDate(d.getDate() - 7);
    expect(new Date(result.date).toDateString()).toBe(d.toDateString());
  });

  it('should handle edge cases with large numbers and multiple decimals gracefully', () => {
    const result = parseNaturalLanguageExpense('paid 1000.99 for groceries');
    expect(result.amount).toBe(1000.99);
    expect(result.category).toBe('Food');
  });
});
