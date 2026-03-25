import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are AutoLeap's internal AI analyst embedded in the executive intelligence dashboard. Given a real-time snapshot of company KPIs and activity, write a sharp, actionable daily briefing. Format your response as clean paragraphs — no markdown headers, no bullet points, no bold text. Use plain prose only. Write 3 short paragraphs: (1) Revenue & Growth summary, (2) Customer Health & Support summary, (3) One specific strategic recommendation for today. Be direct, data-driven, and confident. Tone: executive, not academic. Maximum 180 words total.`;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { metricsSnapshot } = await request.json();

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 512,
            stream: true,
            system: SYSTEM_PROMPT,
            messages: [
              {
                role: "user",
                content: `Here is today's metrics snapshot:\n\n${JSON.stringify(metricsSnapshot, null, 2)}`,
              },
            ],
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.enqueue(
            encoder.encode("\n[Error generating summary. Please try again.]")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("AI Summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary" },
      { status: 500 }
    );
  }
}
