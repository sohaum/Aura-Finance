import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!process.env.HF_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "AI insights are not configured. Please add HF_API_KEY to your environment variables.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const analysisData = await req.json();

    if (!analysisData || !analysisData.totalExpenses) {
      return new Response(
        JSON.stringify({
          error: "Invalid analysis data provided",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Build a more concise prompt for better results
    const prompt = `Analyze these spending patterns and provide financial advice:

Total: $${analysisData.totalExpenses.toFixed(2)} (${
      analysisData.transactionCount
    } transactions)
This month: $${analysisData.thisMonthSpending.toFixed(2)}
Last month: $${analysisData.lastMonthSpending.toFixed(2)}
Top category: ${analysisData.topCategory}

Categories: ${analysisData.categoryBreakdown
      .map((cat) => `${cat.category}: $${cat.amount.toFixed(2)}`)
      .join(", ")}

Provide brief financial insights in JSON format:
{
  "summary": "Brief spending overview",
  "patterns": ["pattern1", "pattern2"],
  "suggestions": ["tip1", "tip2"],
  "budgetTips": ["budget1", "budget2"],
  "concerns": ["concern1"]
}`;

    // Try multiple model endpoints (fallback approach)
    const modelEndpoints = [
      "mistralai/Mistral-7B-Instruct-v0.2",
      "HuggingFaceH4/zephyr-7b-beta",
      "google/flan-t5-large",
      "bigscience/bloomz-560m",
    ];

    let insights;
    let lastError;

    for (const model of modelEndpoints) {
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

          // Handle different response formats
          let text = "";
          if (Array.isArray(hfData) && hfData[0]) {
            text = hfData[0].generated_text || hfData[0].response || "";
          } else if (hfData.generated_text) {
            text = hfData.generated_text;
          }

          // Try to parse as JSON, with fallback
          try {
            const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              insights = JSON.parse(jsonMatch[0]);
              break; // Success, exit the loop
            }
          } catch (parseError) {
            console.warn(
              `JSON parse failed for model ${model}:`,
              parseError.message
            );
          }
        } else {
          lastError = `${model}: ${hfRes.status} ${hfRes.statusText}`;
          console.warn(`Model ${model} failed:`, lastError);
        }
      } catch (error) {
        lastError = `${model}: ${error.message}`;
        console.warn(`Error with model ${model}:`, error.message);
        continue;
      }
    }

    // If no model worked, provide fallback insights
    if (!insights) {
      console.warn(
        "All models failed, using fallback insights. Last error:",
        lastError
      );

      // Generate basic insights based on the data
      const monthlyChange =
        analysisData.thisMonthSpending - analysisData.lastMonthSpending;
      const changePercent =
        analysisData.lastMonthSpending > 0
          ? ((monthlyChange / analysisData.lastMonthSpending) * 100).toFixed(1)
          : 0;

      insights = {
        summary: `You've spent $${analysisData.totalExpenses.toFixed(
          2
        )} across ${analysisData.transactionCount} transactions. ${
          monthlyChange >= 0
            ? "Your spending increased"
            : "Your spending decreased"
        } by ${Math.abs(changePercent)}% compared to last month.`,
        patterns: [
          `Your top spending category is ${analysisData.topCategory}`,
          `Average transaction amount is ₹${
            analysisData.averageTransaction.toFixed(2)
          }`,
          monthlyChange > 0
            ? "Spending increased this month"
            : "Spending decreased this month",
          analysisData.categoryBreakdown.length > 3
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
        concerns:
          monthlyChange > analysisData.lastMonthSpending * 0.2
            ? [
                "Significant increase in spending this month - review recent purchases",
              ]
            : [],
      };
    }

    // Ensure all required fields exist
    insights = {
      summary:
        insights.summary || "Unable to analyze spending patterns at this time.",
      patterns: Array.isArray(insights.patterns) ? insights.patterns : [],
      suggestions: Array.isArray(insights.suggestions)
        ? insights.suggestions
        : [],
      budgetTips: Array.isArray(insights.budgetTips) ? insights.budgetTips : [],
      concerns: Array.isArray(insights.concerns) ? insights.concerns : [],
    };

    return new Response(JSON.stringify(insights), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Insights API Error:", error);

    // Return a more helpful error response
    const fallbackInsights = {
      summary:
        "Unable to generate AI insights at this time due to service limitations.",
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

    return new Response(JSON.stringify(fallbackInsights), {
      status: 200, // Return 200 so the frontend doesn't break
      headers: { "Content-Type": "application/json" },
    });
  }
}
