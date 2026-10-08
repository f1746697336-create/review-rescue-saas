import { buildSystemPrompt } from "@/lib/prompts";
import { FRIENDLY_AI_ERROR } from "@/lib/site";
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

type ChatCompletionChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
};

function aiConfig() {
  const url =
    process.env.AI_API_URL ?? "https://api.deepseek.com/chat/completions";
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? "deepseek-chat";

  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured.");
  }

  return { url, apiKey, model };
}

function chatMessages(review: string, tone: Tone) {
  return [
    { role: "system", content: buildSystemPrompt(tone) },
    {
      role: "user",
      content: `Negative buyer review:\n\n"""${review.trim()}"""\n\nWrite the public reply now.`,
    },
  ];
}

function contentFromSseLine(line: string): string | "DONE" | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (!payload) return null;
  if (payload === "[DONE]") return "DONE";

  try {
    const json = JSON.parse(payload) as ChatCompletionChunk;
    return json.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

export async function generateReviewReply(review: string, tone: Tone) {
  const { url, apiKey, model } = aiConfig();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: chatMessages(review, tone),
    }),
  });

  const data = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    throw new Error(FRIENDLY_AI_ERROR);
  }

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error(FRIENDLY_AI_ERROR);
  }

  return reply;
}

export async function streamReviewReply(
  review: string,
  tone: Tone,
): Promise<ReadableStream<Uint8Array>> {
  const { url, apiKey, model } = aiConfig();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.6,
      messages: chatMessages(review, tone),
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(FRIENDLY_AI_ERROR);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            buffer += decoder.decode();
            const leftover = contentFromSseLine(buffer);
            if (leftover && leftover !== "DONE") {
              controller.enqueue(encoder.encode(leftover));
            }
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          let text = "";
          for (const line of lines) {
            const piece = contentFromSseLine(line);
            if (piece === "DONE") {
              if (text) controller.enqueue(encoder.encode(text));
              controller.close();
              return;
            }
            if (piece) text += piece;
          }

          if (text) {
            controller.enqueue(encoder.encode(text));
            return;
          }
        }
      } catch {
        controller.error(new Error(FRIENDLY_AI_ERROR));
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}
