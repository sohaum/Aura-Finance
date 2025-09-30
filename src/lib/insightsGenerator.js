export function generateFinancialInsights(expenses) {
  const today = new Date();
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  // Filter expenses by month
  const thisMonthExpenses = expenses.filter(exp => 
    new Date(exp.date) >= thisMonthStart
  );
  
  const lastMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= lastMonthStart && expDate <= lastMonthEnd;
  });

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const averageTransaction = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  // Category analysis
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

  const categoryCount = Object.keys(categoryTotals).length;

  // Calculate monthly change
  const monthlyChange = thisMonthTotal - lastMonthTotal;
  const changePercent = lastMonthTotal > 0 
    ? Math.abs((monthlyChange / lastMonthTotal) * 100).toFixed(1)
    : 0;

  // Generate insights
  return {
    summary: generateSummary(totalExpenses, expenses.length, monthlyChange, changePercent, lastMonthTotal),
    patterns: generatePatterns(topCategory, averageTransaction, monthlyChange, categoryCount, thisMonthExpenses),
    suggestions: generateSuggestions(topCategory, monthlyChange, changePercent, categoryTotals, expenses),
    budgetTips: generateBudgetTips(thisMonthTotal, categoryCount),
    concerns: generateConcerns(monthlyChange, lastMonthTotal, averageTransaction, totalExpenses, expenses.length, thisMonthExpenses)
  };
}

function generateSummary(totalExpenses, transactionCount, monthlyChange, changePercent, lastMonthTotal) {
  let summary = `You've spent ₹${totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })} across ${transactionCount} transactions.`;
  
  if (lastMonthTotal > 0) {
    const direction = monthlyChange >= 0 ? 'increased' : 'decreased';
    summary += ` Your spending ${direction} by ${changePercent}% compared to last month.`;
  } else if (transactionCount > 0) {
    summary += ' Keep tracking your expenses to build better financial habits.';
  }

  return summary;
}

function generatePatterns(topCategory, averageTransaction, monthlyChange, categoryCount, thisMonthExpenses) {
  const patterns = [];

  // Top category pattern
  if (topCategory && topCategory !== 'None') {
    const readableCategory = topCategory.charAt(0) + topCategory.slice(1).toLowerCase().replace('_', ' ');
    patterns.push(`Your highest spending is in ${readableCategory} category`);
  }

  // Transaction average pattern
  if (averageTransaction > 0) {
    patterns.push(`Your average transaction is ₹${Math.round(averageTransaction).toLocaleString('en-IN')}`);
  }

  // Trend pattern
  if (monthlyChange > 0) {
    patterns.push('Your spending has increased this month');
  } else if (monthlyChange < 0) {
    patterns.push('Your spending has decreased this month - great job!');
  } else {
    patterns.push('Your spending is consistent with last month');
  }

  // Diversity pattern
  if (categoryCount > 5) {
    patterns.push(`You have diverse spending across ${categoryCount} categories`);
  } else if (categoryCount > 2) {
    patterns.push(`Your spending is spread across ${categoryCount} main categories`);
  } else if (categoryCount > 0) {
    patterns.push('Your spending is concentrated in a few categories');
  }

  // Frequency pattern
  if (thisMonthExpenses.length > 20) {
    patterns.push('You track expenses frequently - excellent habit!');
  } else if (thisMonthExpenses.length > 10) {
    patterns.push('Good expense tracking consistency');
  }

  return patterns.slice(0, 4); // Return top 4 patterns
}

function generateSuggestions(topCategory, monthlyChange, changePercent, categoryTotals, expenses) {
  const suggestions = [];

  // Category-specific suggestions
  if (topCategory) {
    const categoryMap = {
      FOOD: 'meal planning and cooking at home',
      TRANSPORTATION: 'carpooling or using public transport',
      SHOPPING: 'creating shopping lists and avoiding impulse buys',
      ENTERTAINMENT: 'finding free or low-cost activities',
      SUBSCRIPTIONS: 'reviewing and canceling unused subscriptions',
      GROCERIES: 'buying in bulk and comparing prices',
      FITNESS: 'exploring free workout options or home exercises'
    };

    const suggestion = categoryMap[topCategory];
    if (suggestion) {
      suggestions.push(`Consider ${suggestion} to reduce ${topCategory.toLowerCase()} expenses`);
    }
  }

  // Spending increase suggestions
  if (monthlyChange > 0 && changePercent > 20) {
    suggestions.push('Review recent large purchases and evaluate if they were necessary');
    suggestions.push('Set spending alerts to stay within your monthly budget');
  }

  // General suggestions
  suggestions.push('Track expenses daily to build awareness of spending habits');
  
  // Subscription check
  const hasSubscriptions = expenses.some(exp => exp.category === 'SUBSCRIPTIONS');
  if (hasSubscriptions) {
    suggestions.push('Review all subscriptions - cancel services you rarely use');
  }

  // Large transaction suggestion
  const largeTransactions = expenses.filter(exp => exp.amount > (categoryTotals[exp.category] / expenses.length) * 2);
  if (largeTransactions.length > 0) {
    suggestions.push('Plan for large expenses in advance to avoid budget surprises');
  }

  return suggestions.slice(0, 4); // Return top 4 suggestions
}

function generateBudgetTips(thisMonthTotal, categoryCount) {
  const tips = [
    'Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
    'Set up automatic transfers to your savings account each month',
    'Create category-wise monthly budgets to control spending'
  ];

  if (thisMonthTotal > 10000) {
    tips.push('Consider opening a high-yield savings account for better returns');
  } else {
    tips.push('Build an emergency fund with 3-6 months of expenses');
  }

  if (categoryCount > 5) {
    tips.push('Use the envelope method to allocate cash for different categories');
  }

  return tips;
}

function generateConcerns(monthlyChange, lastMonthTotal, averageTransaction, totalExpenses, transactionCount, thisMonthExpenses) {
  const concerns = [];

  // Significant spending increase
  if (monthlyChange > lastMonthTotal * 0.3 && lastMonthTotal > 0) {
    concerns.push('⚠️ Spending increased by more than 30% - review recent purchases carefully');
  }

  // Large transaction concern
  if (averageTransaction > totalExpenses * 0.4 && transactionCount < 5) {
    concerns.push('⚠️ Large transactions detected - ensure these align with your budget');
  }

  // High daily average
  const dailyAverage = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) / new Date().getDate();
  if (dailyAverage > 500 && thisMonthExpenses.length > 5) {
    concerns.push('💡 Your daily spending average is ₹' + Math.round(dailyAverage) + ' - consider setting a daily limit');
  }

  // Weekend spending pattern
  const weekendExpenses = thisMonthExpenses.filter(exp => {
    const day = new Date(exp.date).getDay();
    return day === 0 || day === 6;
  });
  
  if (weekendExpenses.length > thisMonthExpenses.length * 0.4) {
    const weekendTotal = weekendExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    if (weekendTotal > thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 0.5) {
      concerns.push('📊 Over 50% of spending occurs on weekends - plan weekend activities on a budget');
    }
  }

  return concerns;
}