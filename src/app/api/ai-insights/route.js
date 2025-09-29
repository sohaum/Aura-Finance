export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // ensure server-only execution

export async function POST(req) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");

    // Model endpoints
    const MODEL_ENDPOINTS = [
      "mistralai/Mistral-7B-Instruct-v0.2",
      "HuggingFaceH4/zephyr-7b-beta",
      "google/flan-t5-large",
      "bigscience/bloomz-560m",
    ];

    // Helper: Fallback insights
    function generateFallbackInsights(data) {
      const monthlyChange = data.thisMonthSpending - data.lastMonthSpending;
      const changePercent =
        data.lastMonthSpending > 0
          ? ((monthlyChange / data.lastMonthSpending) * 100).toFixed(1)
          : 0;

      return {
        summary: `You've spent ₹${data.totalExpenses.toFixed(
          2
        )} across ${data.transactionCount} transactions. ${
          monthlyChange >= 0 ? "Your spending increased" : "Your spending decreased"
        } by ${Math.abs(changePercent)}% compared to last month.`,
        patterns: [
          `Top category: ${data.topCategory}`,
          `Average transaction: ₹${data.averageTransaction?.toFixed(2) || "0.00"}`,
          monthlyChange >= 0 ? "Spending increased this month" : "Spending decreased this month",
          data.categoryBreakdown?.length > 3
            ? "Diverse spending across multiple categories"
            : "Spending concentrated in few categories",
        ],
        suggestions: [
          "Track daily expenses to identify patterns",
          `Set a budget limit for ${data.topCategory}`,
          "Review subscriptions and recurring payments",
          "Look for ways to reduce discretionary spending",
        ],
        budgetTips: [
          "50/30/20 rule: 50% needs, 30% wants, 20% savings",
          "Set automatic transfers to savings",
          "Use envelope method for discretionary categories",
        ],
        concerns:
          monthlyChange > data.lastMonthSpending * 0.2
            ? ["Significant increase in spending this month"]
            : [],
      };
    }

    // Helper: AI analysis
    async function tryAIAnalysis(prompt) {
      if (!process.env.HF_API_KEY) return null;

      for (const model of MODEL_ENDPOINTS) {
        try {
          const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 250, temperature: 0.7 } }),
          });

          if (res.ok) {
            const data = await res.json();
            let text = Array.isArray(data) ? data[0]?.generated_text || "" : data.generated_text || "";
            const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
          }
        } catch (err) {
          console.warn(`HF model ${model} failed: ${err.message}`);
          continue;
        }
      }
      return null;
    }

    // --- Begin POST handler logic ---
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const analysisData = await req.json();
    if (!analysisData?.totalExpenses) {
      return new Response(JSON.stringify({ error: "Invalid analysis data" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const fallbackInsights = generateFallbackInsights(analysisData);

    if (!process.env.HF_API_KEY) {
      return new Response(JSON.stringify({
        ...fallbackInsights,
        summary: "Basic analysis provided. AI insights require API key."
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const prompt = `Analyze these spending patterns and provide financial advice:

Total: ₹${analysisData.totalExpenses.toFixed(2)} (${analysisData.transactionCount} transactions)
This month: ₹${analysisData.thisMonthSpending.toFixed(2)}
Last month: ₹${analysisData.lastMonthSpending.toFixed(2)}
Top category: ${analysisData.topCategory}

Categories: ${analysisData.categoryBreakdown?.map(c => `${c.category}: ₹${c.amount.toFixed(2)}`).join(", ") || "None"}

Provide brief financial insights in JSON format:
{
  "summary": "Brief overview",
  "patterns": ["pattern1", "pattern2"],
  "suggestions": ["tip1", "tip2"],
  "budgetTips": ["budget1", "budget2"],
  "concerns": ["concern1"]
}`;

    const aiInsights = await tryAIAnalysis(prompt);
    const insights = aiInsights || fallbackInsights;

    const finalInsights = {
      summary: insights.summary || fallbackInsights.summary,
      patterns: Array.isArray(insights.patterns) ? insights.patterns : fallbackInsights.patterns,
      suggestions: Array.isArray(insights.suggestions) ? insights.suggestions : fallbackInsights.suggestions,
      budgetTips: Array.isArray(insights.budgetTips) ? insights.budgetTips : fallbackInsights.budgetTips,
      concerns: Array.isArray(insights.concerns) ? insights.concerns : fallbackInsights.concerns,
    };

    return new Response(JSON.stringify(finalInsights), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("AI Insights API Error:", error);
    const fallback = {
      summary: "Unable to generate insights. Try again later.",
      patterns: ["Manual expense tracking recommended"],
      suggestions: ["Review spending categories", "Set monthly limits", "Compare monthly expenses"],
      budgetTips: ["Create monthly budget", "Track fixed vs variable expenses", "Build emergency fund"],
      concerns: [],
    };
    return new Response(JSON.stringify(fallback), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}
