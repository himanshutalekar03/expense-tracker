export function parseNaturalLanguageExpense(text: string) {
  // A simple rule-based parser
  // Example: "Spent 500 on petrol today" or "Bought groceries for 150 yesterday"
  
  const result = {
    amount: 0,
    category: 'General',
    description: text,
    date: new Date().toISOString(),
  };

  // Extract amount
  const amountMatch = text.match(/\d+(\.\d+)?/);
  if (amountMatch) {
    result.amount = parseFloat(amountMatch[0]);
  }

  // Extract category (simple keyword matching)
  const lowerText = text.toLowerCase();
  if (lowerText.includes('food') || lowerText.includes('groceries') || lowerText.includes('restaurant')) {
    result.category = 'Food';
  } else if (lowerText.includes('petrol') || lowerText.includes('gas') || lowerText.includes('uber') || lowerText.includes('transport')) {
    result.category = 'Transport';
  } else if (lowerText.includes('movie') || lowerText.includes('games') || lowerText.includes('entertainment')) {
    result.category = 'Entertainment';
  } else if (lowerText.includes('rent') || lowerText.includes('bill') || lowerText.includes('utility')) {
    result.category = 'Bills';
  }

  // Extract date roughly
  if (lowerText.includes('yesterday')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    result.date = d.toISOString();
  } else if (lowerText.includes('last week')) {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    result.date = d.toISOString();
  }

  return result;
}
