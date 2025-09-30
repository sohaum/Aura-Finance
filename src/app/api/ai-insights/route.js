// export const dynamic = 'force-dynamic';

// export async function POST(req) {
//   try {
//     const analysisData = await req.json();

//     const monthlyChange = analysisData.thisMonthSpending - analysisData.lastMonthSpending;
//     const changePercent = analysisData.lastMonthSpending > 0
//       ? Math.abs((monthlyChange / analysisData.lastMonthSpending) * 100).toFixed(1)
//       : 0;

//     const insights = {
//       summary: `You've spent ₹${analysisData.totalExpenses.toFixed(2)} across ${analysisData.transactionCount} transactions. Your spending ${monthlyChange >= 0 ? 'increased' : 'decreased'} by ${changePercent}% compared to last month.`,
//       patterns: [
//         `Your top spending category is ${analysisData.topCategory}`,
//         `Average transaction amount is ₹${analysisData.averageTransaction?.toFixed(2) || '0.00'}`,
//         monthlyChange > 0 ? 'Spending increased this month' : 'Spending decreased this month'
//       ],
//       suggestions: [
//         'Track your daily expenses to identify patterns',
//         `Consider setting a budget limit for ${analysisData.topCategory} category`,
//         'Review subscription services and recurring payments'
//       ],
//       budgetTips: [
//         'Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
//         'Set up automatic transfers to your savings account',
//         'Use the envelope method for discretionary spending'
//       ],
//       concerns: monthlyChange > (analysisData.lastMonthSpending * 0.3)
//         ? ['Significant spending increase detected - review recent purchases']
//         : []
//     };

//     return Response.json(insights);

//   } catch (error) {
//     console.error('Insights error:', error);
//     return Response.json({
//       summary: 'Basic analysis provided.',
//       patterns: ['Track expenses regularly'],
//       suggestions: ['Set monthly spending limits'],
//       budgetTips: ['Create a realistic budget'],
//       concerns: []
//     });
//   }
// }