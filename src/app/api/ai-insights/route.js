export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Generate insights based on expense data
function generateInsights(data) {
  const {
    totalExpenses = 0,
    transactionCount = 0,
    thisMonthSpending = 0,
    lastMonthSpending = 0,
    topCategory = 'Unknown',
    averageTransaction = 0,
    categoryBreakdown = []
  } = data;

  // Calculate monthly change
  const monthlyChange = thisMonthSpending - lastMonthSpending;
  const changePercent = lastMonthSpending > 0 
    ? Math.abs((monthlyChange / lastMonthSpending) * 100).toFixed(1)
    : 0;

  // Generate dynamic summary
  let summary = `You've spent ₹${totalExpenses.toFixed(2)} across ${transactionCount} transactions.`;
  
  if (lastMonthSpending > 0) {
    const direction = monthlyChange >= 0 ? 'increased' : 'decreased';
    summary += ` Your spending ${direction} by ${changePercent}% compared to last month.`;
  }

  // Generate patterns based on data
  const patterns = [];
  if (topCategory && topCategory !== 'Unknown') {
    patterns.push(`Your top spending category is ${topCategory}`);
  }
  if (averageTransaction > 0) {
    patterns.push(`Average transaction amount is ₹${averageTransaction.toFixed(2)}`);
  }
  if (monthlyChange !== 0) {
    patterns.push(monthlyChange > 0 ? 'Spending increased this month' : 'Spending decreased this month');
  }
  if (categoryBreakdown.length > 0) {
    const diversityText = categoryBreakdown.length > 3 
      ? 'You have diverse spending across multiple categories'
      : 'Your spending is concentrated in few categories';
    patterns.push(diversityText);
  }

  // Generate contextual suggestions
  const suggestions = [];
  suggestions.push('Track your daily expenses to identify patterns');
  
  if (topCategory && topCategory !== 'Unknown') {
    suggestions.push(`Consider setting a budget limit for ${topCategory} category`);
  }
  
  suggestions.push('Review subscription services and recurring payments');
  
  if (monthlyChange > 0 && changePercent > 20) {
    suggestions.push('Look for opportunities to reduce discretionary spending');
  } else {
    suggestions.push('Continue monitoring spending trends');
  }

  // Standard budget tips
  const budgetTips = [
    'Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
    'Set up automatic transfers to your savings account',
    'Use the envelope method for discretionary spending categories',
    'Review your expenses weekly to stay on track'
  ];

  // Generate concerns based on spending patterns
  const concerns = [];
  if (monthlyChange > lastMonthSpending * 0.3) {
    concerns.push('Significant spending increase detected - review recent purchases');
  }
  if (averageTransaction > totalExpenses * 0.4 && transactionCount < 5) {
    concerns.push('Few large transactions detected - ensure these are planned expenses');
  }

  return {
    summary,
    patterns: patterns.length > 0 ? patterns : ['Start tracking expenses regularly for better insights'],
    suggestions,
    budgetTips,
    concerns
  };
}

export async function POST(req) {
  try {
    // Dynamic import to avoid build-time execution
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request data
    let analysisData;
    try {
      analysisData = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate data
    if (!analysisData || typeof analysisData.totalExpenses === 'undefined') {
      return new Response(JSON.stringify({ error: "Missing expense data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate insights
    const insights = generateInsights(analysisData);

    // Try AI enhancement if API key is available
    if (process.env.HF_API_KEY) {
      try {
        const aiInsights = await tryAIEnhancement(analysisData, insights);
        if (aiInsights) {
          // Merge AI insights with fallback insights
          return new Response(JSON.stringify({
            ...insights,
            ...aiInsights,
            summary: aiInsights.summary || insights.summary
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (aiError) {
        console.warn('AI enhancement failed:', aiError.message);
        // Continue with standard insights
      }
    }

    return new Response(JSON.stringify(insights), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('AI Insights API Error:', error);

    // Return safe fallback
    const fallbackResponse = {
      summary: 'Expense analysis completed. Continue tracking your spending for better insights.',
      patterns: [
        'Regular expense tracking builds financial awareness',
        'Monthly reviews help identify spending trends'
      ],
      suggestions: [
        'Set clear monthly spending limits',
        'Review and categorize all expenses',
        'Track both fixed and variable costs'
      ],
      budgetTips: [
        'Create a realistic monthly budget',
        'Separate needs from wants in your spending',
        'Build an emergency fund gradually'
      ],
      concerns: []
    };

    return new Response(JSON.stringify(fallbackResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Optional AI enhancement (only runs if API key exists)
async function tryAIEnhancement(data, fallbackInsights) {
  if (!process.env.HF_API_KEY) return null;

  const models = [
    'mistralai/Mistral-7B-Instruct-v0.2',
    'google/flan-t5-large'
  ];

  const prompt = `Analyze spending: Total ₹${data.totalExpenses?.toFixed(2) || 0}, Category: ${data.topCategory || 'Mixed'}. 
Monthly change: ${((data.thisMonthSpending || 0) - (data.lastMonthSpending || 0)).toFixed(2)}. 
Provide JSON with brief summary, 2-3 patterns, 2-3 suggestions only.`;

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.6,
            return_full_text: false
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        const text = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
        
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // Validate the AI response has required fields
            if (parsed.summary || parsed.patterns || parsed.suggestions) {
              return {
                summary: parsed.summary || fallbackInsights.summary,
                patterns: Array.isArray(parsed.patterns) ? parsed.patterns : fallbackInsights.patterns,
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : fallbackInsights.suggestions,
                budgetTips: fallbackInsights.budgetTips, // Always use fallback for budget tips
                concerns: Array.isArray(parsed.concerns) ? parsed.concerns : fallbackInsights.concerns
              };
            }
          }
        }
      }
    } catch (error) {
      console.warn(`AI model ${model} failed:`, error.message);
      continue;
    }
  }

  return null; // AI enhancement failed, use fallback
}