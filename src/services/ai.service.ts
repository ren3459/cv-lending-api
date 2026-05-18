import { env } from "../config/env";

export async function generateSummary(prompt: string): Promise<string> {
  if (!env.DEEPSEEK_API_KEY) {
    return fallbackSummary(prompt);
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Ты frontend lead. Сформулируй короткое резюме проекта на русском в одном абзаце, без списков.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("DeepSeek API returned an error. Check the API key and model.");
  }

  const data: unknown = await response.json();
  return extractMessageContent(data) || fallbackSummary(prompt);
}

function fallbackSummary(prompt: string): string {
  const normalized = prompt || "Проект с frontend, API и пользовательским сценарием";

  return `AI fallback: ${normalized}. Короткое резюме: собрать понятный интерфейс, описать API-контракт, обработать загрузку, успех и ошибки, затем вручную проверить сценарий пользователя.`;
}

function extractMessageContent(data: unknown): string {
  if (typeof data !== "object" || data === null) {
    return "";
  }

  const choices = (data as { choices?: unknown }).choices;

  if (!Array.isArray(choices)) {
    return "";
  }

  const [firstChoice] = choices;

  if (typeof firstChoice !== "object" || firstChoice === null) {
    return "";
  }

  const message = (firstChoice as { message?: unknown }).message;

  if (typeof message !== "object" || message === null) {
    return "";
  }

  const content = (message as { content?: unknown }).content;
  return typeof content === "string" ? content : "";
}
