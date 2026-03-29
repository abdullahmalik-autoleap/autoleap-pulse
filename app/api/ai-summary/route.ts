import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { groq } from "@/lib/groq";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { metricsSnapshot } = await request.json();

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are AutoLeap's internal AI analyst embedded in the executive
intelligence dashboard. Given a real-time snapshot of company KPIs and activity,
write a sharp, actionable daily briefing. Format your response as clean paragraphs
— no markdown headers, no bullet points, no bold text. Use plain prose only.
Write 3 short paragraphs: (1) Revenue & Growth summary, (2) Customer Health &
Support summary, (3) One specific strategic recommendation for today. Be direct,
data-driven, and confident. Tone: executive, not academic. Maximum 180 words total.`,
        },
        {
          role: "user",
          content: `Today's AutoLeap metrics snapshot:\n\n${JSON.stringify(metricsSnapshot, null, 2)}`,
        },
      ],
      max_tokens: 400,
      stream: true,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(new TextEncoder().encode(text));
          }
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("AI Summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary" },
      { status: 500 }
    );
  }
}
