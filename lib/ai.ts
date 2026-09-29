import { buildSystemPrompt } from "@/lib/prompts";
import type { Tone } from "@/lib/types";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function generateReviewReply(review: string, tone: Tone) {
  const url = process.env.AI_API_URL ?? "https://api.deepseek.com/chat/completions";
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? "deepseek-chat";

  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [
        { role: "system", content: buildSystemPrompt(tone) },
        {
          role: "user",
          content: `Negative buyer review:\n\n"""${review.trim()}"""\n\nWrite the public reply now.`,
        },
      ],
    }),
  });

  const data = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "AI provider request failed.");
  }

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("The AI provider returned an empty reply.");
  }

  return reply;
}
