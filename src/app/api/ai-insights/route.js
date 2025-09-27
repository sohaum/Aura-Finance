import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Move the model endpoints to a constant
const MODEL_ENDPOINTS = [
  "mistralai/Mistral-7B-Instruct-v0.2",
  "HuggingFaceH4/zephyr-7b-beta", 
  "google/flan-t5-large",
  "bigscience/bloomz-560m",
];

// Helper function to generate fallback insights
function generateFallbackInsights(analysisData) {
  const monthlyChange = analysisData.thisMonthSpending - analysisData.lastMonthSpending;
  const changePercent = analysisData.lastMonthSpending > 0
    ? ((monthlyChange / analysisData.lastMonthSpending) * 100).toFixed(1)
    : 0;

  return {
    summary: `You've spent $${analysisData.totalExpenses.toFixed(2)} across ${
      analysisData.transactionCount
    } transactions. ${
      monthlyChange >= 0 ? "Your spending increased" : "Your spending decreased"
    } by ${Math.abs(changePercent)}% compared to last month.`,
    patterns: [
      `Your top spending category is ${analysisData.topCategory}`,
      `Average transaction amount is ₹${analysisData.averageTransaction?.toFixed(2) || '0.00'}`,
      monthlyChange > 0 ? "Spending increased this month" : "Spending decreased this month",
      analysisData.categoryBreakdown?.length > 3
        ? "You have diverse spending across multiple categories"
        : "Your spending is concentrated in few categories",
    ],
    suggestions: [
      "Track your daily expenses to identify patterns",
      `Consider setting a budget limit for ${analysisData.topCategory} category`,
      "Review subscription services and recurring payments",
      "Look for opportunities to reduce discretionary spending",
    ],
    budgetTips: [
      "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
      "Set up automatic transfers to your savings account",
      "Use the envelope method for discretionary spending categories",
    ],
    concerns: monthlyChange > (analysisData.lastMonthSpending * 0.2)
      ? ["Significant increase in spending this month - review recent purchases"]
      : [],
  };
}

// Helper function to try AI analysis
async function tryAIAnalysis(prompt) {
  if (!process.env.HF_API_KEY) {
    return null;
  }

  for (const model of MODEL_ENDPOINTS) {
    try {
      const hfRes = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 250,
              temperature: 0.7,
              return_full_text: false,
            },
          }),
        }
      );

      if (hfRes.ok) {
        const hfData = await hfRes.json();
        
        let text = "";
        if (Array.isArray(hfData) && hfData[0]) {
          text = hfData[0].generated_text || hfData[0].response || "";
        } else if (hfData.generated_text) {
          text = hfData.generated_text;
        }

        try {
          const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.warn(`JSON parse failed for model ${model}:`, parseError.message);
        }
      }
    } catch (error) {
      console.warn(`Error with model ${model}:`, error.message);
      continue;
    }
  }
  
  return null;
}

export async function POST(req) {
  try {
    // Check authentication first
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request data
    const analysisData = await req.json();
    if (!analysisData?.totalExpenses) {
      return new Response(JSON.stringify({ error: "Invalid analysis data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate fallback insights first
    const fallbackInsights = generateFallbackInsights(analysisData);

    // If no HF API key, return fallback with a note
    if (!process.env.HF_API_KEY) {
      return new Response(JSON.stringify({
        ...fallbackInsights,
        summary: "Basic analysis provided. AI insights require API configuration."
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Try AI analysis
    const prompt = `Analyze these spending patterns and provide financial advice:

Total: ₹${analysisData.totalExpenses.toFixed(2)} (${analysisData.transactionCount} transactions)
This month: ₹${analysisData.thisMonthSpending.toFixed(2)}
Last month: ₹${analysisData.lastMonthSpending.toFixed(2)}
Top category: ${analysisData.topCategory}

Categories: ${analysisData.categoryBreakdown
  ?.map((cat) => `${cat.category}: $${cat.amount.toFixed(2)}`)
  ?.join(", ") || 'No categories available'}

Provide brief financial insights in JSON format:
{
  "summary": "Brief spending overview",
  "patterns": ["pattern1", "pattern2"],
  "suggestions": ["tip1", "tip2"],
  "budgetTips": ["budget1", "budget2"],
  "concerns": ["concern1"]
}`;

    const aiInsights = await tryAIAnalysis(prompt);
    
    // Use AI insights if available, otherwise use fallback
    const insights = aiInsights || fallbackInsights;

    // Ensure all required fields exist and are properly formatted
    const finalInsights = {
      summary: insights.summary || fallbackInsights.summary,
      patterns: Array.isArray(insights.patterns) ? insights.patterns : fallbackInsights.patterns,
      suggestions: Array.isArray(insights.suggestions) ? insights.suggestions : fallbackInsights.suggestions,
      budgetTips: Array.isArray(insights.budgetTips) ? insights.budgetTips : fallbackInsights.budgetTips,
      concerns: Array.isArray(insights.concerns) ? insights.concerns : fallbackInsights.concerns,
    };

    return new Response(JSON.stringify(finalInsights), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Insights API Error:", error);

    // Return a safe fallback response
    const errorFallback = {
      summary: "Unable to generate insights at this time. Please try again later.",
      patterns: ["Manual expense tracking recommended"],
      suggestions: [
        "Review your spending categories regularly",
        "Set monthly spending limits for each category",
        "Compare monthly expenses to identify trends",
      ],
      budgetTips: [
        "Create a monthly budget plan",
        "Track fixed vs variable expenses",
        "Build an emergency fund",
      ],
      concerns: [],
    };

    return new Response(JSON.stringify(errorFallback), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}