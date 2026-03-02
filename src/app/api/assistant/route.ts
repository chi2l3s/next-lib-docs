import { NextResponse } from "next/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { retrieveRelevantChunks } from "@/lib/assistant-rag";

type AssistantRequest = {
  locale?: string;
  question?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  stream?: boolean;
};

type AssistantResult = {
  answer: string;
  sources: Array<{ title: string; href: string }>;
  usedModel: "local-rag" | string;
  debug?: {
    providerTried?: string;
    providerError?: string;
  };
};

function isSupportedLocale(locale: string): locale is AppLocale {
  return routing.locales.includes(locale as AppLocale);
}

function uniqueSources(
  items: Array<{ source: { title: string; href: string } }>,
): Array<{ title: string; href: string }> {
  const seen = new Set<string>();
  const result: Array<{ title: string; href: string }> = [];
  for (const item of items) {
    const key = `${item.source.title}:${item.source.href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item.source);
  }
  return result;
}

function buildFallbackAnswer(
  locale: AppLocale,
  question: string,
  snippets: Array<{ text: string; source: { title: string; href: string } }>,
) {
  if (!snippets.length) {
    return locale === "ru"
      ? "Не нашёл точного ответа в локальной документации. Уточните вопрос: модуль, метод или конкретную ошибку."
      : "I couldn't find an exact answer in local docs. Please specify the module, method, or error.";
  }

  const intro =
    locale === "ru"
      ? `По документации NextLib по вопросу "${question}" нашёл следующее:`
      : `From NextLib docs, here is what I found for "${question}":`;
  const bullets = snippets
    .slice(0, 3)
    .map((item) => `- ${item.text.slice(0, 260).trim()}`)
    .join("\n");
  const outro =
    locale === "ru"
      ? "\n\nЕсли нужно, задам это как пошаговую инструкцию под твой сценарий."
      : "\n\nIf needed, I can rewrite this into step-by-step instructions for your exact use case.";
  return `${intro}\n${bullets}${outro}`;
}

async function callOpenAIResponses(
  locale: AppLocale,
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  contextBlocks: string[],
) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const model = process.env.NEXTLIB_ASSISTANT_MODEL ?? "gpt-4.1-mini";
  const context = contextBlocks
    .map((block, index) => `Source ${index + 1}:\n${block}`)
    .join("\n\n");

  const systemPrompt =
    locale === "ru"
      ? "Ты AI-помощник по библиотеке NextLib. Отвечай только на основе контекста и истории. Если данных мало, явно напиши это и предложи уточнение. Не придумывай несуществующие API."
      : "You are an AI assistant for NextLib docs. Answer using only provided context and history. If context is insufficient, say so and ask for clarification. Do not invent APIs.";

  const conversation = history
    .slice(-6)
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n");

  const userPrompt = `${locale === "ru" ? "История:" : "History:"}\n${conversation || "-"}\n\n${
    locale === "ru" ? "Контекст:" : "Context:"
  }\n${context}\n\n${locale === "ru" ? "Вопрос:" : "Question:"}\n${question}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  const textFromOutput =
    data.output_text?.trim() ||
    data.output
      ?.flatMap((item) => item.content ?? [])
      .filter((part) => part.type === "output_text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim() ||
    "";

  if (!textFromOutput) return null;
  return { text: textFromOutput, model };
}

async function callOpenRouterChat(
  locale: AppLocale,
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  contextBlocks: string[],
) {
  const key = process.env.OPENROUTER_API_KEY ?? process.env.OPEN_ROUTER_API_KEY;
  if (!key) return { error: "Missing OPENROUTER_API_KEY (or OPEN_ROUTER_API_KEY)." };

  const model = process.env.NEXTLIB_ASSISTANT_MODEL ?? "openai/gpt-4.1-mini";
  const endpoint = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1/chat/completions";

  const systemPrompt =
    locale === "ru"
      ? "Ты AI-помощник по библиотеке NextLib. Отвечай строго по контексту. Если контекста недостаточно, явно скажи это и попроси уточнение. Не придумывай методы API."
      : "You are an AI assistant for NextLib docs. Answer strictly from context. If context is insufficient, clearly say so and ask for clarification. Do not invent API methods.";

  const context = contextBlocks
    .map((block, index) => `Source ${index + 1}:\n${block}`)
    .join("\n\n");
  const conversation = history
    .slice(-6)
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n");
  const userPrompt = `${locale === "ru" ? "История:" : "History:"}\n${conversation || "-"}\n\n${
    locale === "ru" ? "Контекст:" : "Context:"
  }\n${context}\n\n${locale === "ru" ? "Вопрос:" : "Question:"}\n${question}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "NextLib Docs Assistant",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  console.log(response)

  if (!response.ok) {
    const details = await response.text();
    return { error: `OpenRouter error ${response.status}: ${details.slice(0, 300)}` };
  }
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return { error: "OpenRouter returned empty response." };
  return { text, model };
}

async function callLLM(
  locale: AppLocale,
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  contextBlocks: string[],
) {
  const provider = (process.env.NEXTLIB_ASSISTANT_PROVIDER ?? "").toLowerCase();
  if (provider === "openrouter") {
    return callOpenRouterChat(locale, question, history, contextBlocks);
  }
  if (provider === "openai") {
    return callOpenAIResponses(locale, question, history, contextBlocks);
  }

  return (await callOpenRouterChat(locale, question, history, contextBlocks)) ?? (await callOpenAIResponses(locale, question, history, contextBlocks));
}

export async function POST(request: Request) {
  const payload = (await request.json()) as AssistantRequest;
  const rawLocale = payload.locale ?? routing.defaultLocale;
  const locale: AppLocale = isSupportedLocale(rawLocale) ? rawLocale : routing.defaultLocale;
  const question = payload.question?.trim() ?? "";
  const history = Array.isArray(payload.history) ? payload.history : [];
  const wantsStream = Boolean(payload.stream);

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const retrieved = retrieveRelevantChunks(locale, question, 6);
  const sources = uniqueSources(retrieved);
  const contextBlocks = retrieved.map((item) => `${item.source.title}\n${item.text}`);

  const llmAnswer = await callLLM(locale, question, history, contextBlocks);
  const llmText = llmAnswer && "text" in llmAnswer ? llmAnswer.text : null;
  const llmModel = llmAnswer && "model" in llmAnswer ? llmAnswer.model : null;
  const llmError = llmAnswer && "error" in llmAnswer ? llmAnswer.error : null;
  const answer =
    llmText ?? buildFallbackAnswer(locale, question, retrieved.map((item) => ({ text: item.text, source: item.source })));

  if (wantsStream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const chunkSize = 18;
        for (let i = 0; i < answer.length; i += chunkSize) {
          const delta = answer.slice(i, i + chunkSize);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "delta", delta })}\n\n`));
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              sources,
              usedModel: llmModel ?? "local-rag",
              debug: llmError
                ? {
                    providerTried: process.env.NEXTLIB_ASSISTANT_PROVIDER || "auto",
                    providerError: llmError,
                  }
                : undefined,
            })}\n\n`,
          ),
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const result: AssistantResult = {
    answer,
    sources,
    usedModel: llmModel ?? "local-rag",
    debug: llmError
      ? {
          providerTried: process.env.NEXTLIB_ASSISTANT_PROVIDER || "auto",
          providerError: llmError,
        }
      : undefined,
  };

  return NextResponse.json(result);
}
