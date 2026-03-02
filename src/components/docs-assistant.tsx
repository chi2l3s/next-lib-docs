"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { AssistantMarkdown } from "@/components/assistant-markdown";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; href: string }>;
};

type StreamEvent =
  | { type: "delta"; delta: string }
  | { type: "done"; sources?: Array<{ title: string; href: string }>; usedModel?: string };

export function DocsAssistant({ locale }: { locale: AppLocale }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        locale === "ru"
          ? "Привет. Я помощник по **NextLib**. Пиши вопросы по Database, GUI, Command API, Item API и конфигам."
          : "Hi. I am your **NextLib** assistant. Ask about Database, GUI, Command API, Item API, and configs.",
    },
  ]);
  const [usedModel, setUsedModel] = useState<string>("local-rag");

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const labels = useMemo(
    () =>
      locale === "ru"
        ? {
            title: "NextLib AI",
            subtitle: "Умный помощник по документации",
            placeholder: "Например: как исправить ошибку JDBC driver not found?",
            ask: "Отправить",
            thinking: "Готовлю ответ...",
            sources: "Источники",
            clear: "Очистить историю",
            open: "Открыть AI",
            engine: "Движок",
          }
        : {
            title: "NextLib AI",
            subtitle: "Smart docs assistant",
            placeholder: "Example: how to fix JDBC driver not found error?",
            ask: "Send",
            thinking: "Preparing answer...",
            sources: "Sources",
            clear: "Clear history",
            open: "Open AI",
            engine: "Engine",
          },
    [locale],
  );

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, loading]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function ask() {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const assistantId = `a_${Date.now()}`;
    const pendingAssistant: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      sources: [],
    };
    const newHistory = [...messages, userMessage];
    setMessages([...newHistory, pendingAssistant]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          question: trimmed,
          history: newHistory.map((item) => ({ role: item.role, content: item.content })),
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream unavailable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const appendAssistant = (delta: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: `${msg.content}${delta}`,
                }
              : msg,
          ),
        );
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part
            .split("\n")
            .find((item) => item.startsWith("data: "));
          if (!line) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;

          const event = JSON.parse(payload) as StreamEvent;
          if (event.type === "delta") {
            appendAssistant(event.delta);
          }
          if (event.type === "done") {
            if (event.usedModel) setUsedModel(event.usedModel);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      sources: event.sources ?? [],
                      content:
                        msg.content.trim() ||
                        (locale === "ru"
                          ? "Не удалось сформировать ответ. Уточни вопрос."
                          : "Could not produce an answer. Please clarify your question."),
                    }
                  : msg,
              ),
            );
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content:
                  locale === "ru"
                    ? "Ошибка запроса к помощнику. Проверь соединение и повтори."
                    : "Assistant request failed. Check connection and try again.",
              }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 [backdrop-filter:none]">
      <LayoutGroup id="assistant-widget">
        <AnimatePresence initial={false} mode="sync">
          {!open ? (
            <motion.button
              key="assistant-trigger"
              type="button"
              layoutId="assistant-shell"
              onClick={() => setOpen(true)}
              aria-label={labels.open}
              className="pointer-events-auto relative inline-flex items-center gap-2 rounded-2xl border bg-black px-4 py-3 text-sm font-extrabold text-white shadow-lg dark:bg-white dark:text-black"
              style={{ transformOrigin: "bottom right" }}
              initial={{ opacity: 0, y: 8, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              transition={{
                layout: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
                duration: 0.34,
              }}
            >
              <Bot size={16} />
              <span>AI</span>
              <Sparkles size={14} />
            </motion.button>
          ) : (
            <motion.div
              key="assistant-panel"
              layoutId="assistant-shell"
              className="pointer-events-auto flex h-[min(74vh,700px)] w-[min(94vw,450px)] flex-col overflow-hidden rounded-3xl border surface shadow-2xl"
              style={{ transformOrigin: "bottom right" }}
              initial={{ opacity: 0.96, y: 4, filter: "blur(7px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0.96, y: 4, filter: "blur(5px)" }}
              transition={{
                layout: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
                duration: 0.34,
              }}
            >
              <motion.div
                className="relative border-b px-4 py-3"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06, duration: 0.2 }}
              >
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl border">
                      <MessageCircle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold">{labels.title}</p>
                      <p className="text-xs opacity-70">{labels.subtitle}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
                    aria-label="Close assistant"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="relative mt-2 flex items-center justify-between text-[11px]">
                  <span className="opacity-60">{labels.engine}</span>
                  <span className="rounded-full border px-2 py-0.5 font-bold opacity-80">{usedModel}</span>
                </div>
              </motion.div>

              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={message.role === "user" ? "text-right" : "text-left"}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`inline-block max-w-[92%] rounded-2xl px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "border surface-muted"
                      }`}
                    >
                      {message.role === "assistant" ? <AssistantMarkdown content={message.content} /> : <p>{message.content}</p>}
                    </div>
                    {message.role === "assistant" && message.sources && message.sources.length > 0 ? (
                      <div className="mt-2 space-y-1 text-left">
                        <p className="text-[11px] uppercase tracking-wide opacity-60">{labels.sources}</p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.slice(0, 4).map((source) => (
                            <a
                              key={`${message.id}_${source.href}_${source.title}`}
                              href={`/${locale}${source.href}`}
                              className="rounded-full border px-2 py-1 text-[11px] transition hover:-translate-y-px hover:bg-black/5 dark:hover:bg-white/10"
                            >
                              {source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                ))}

                {loading ? (
                  <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm opacity-80">
                    <Loader2 className="animate-spin" size={14} />
                    {labels.thinking}
                  </div>
                ) : null}
              </div>

              <motion.div
                className="border-t p-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.2 }}
              >
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder={labels.placeholder}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void ask();
                      }
                    }}
                    className="h-11 flex-1 rounded-xl border bg-transparent px-3 text-sm outline-none transition focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => void ask()}
                    disabled={loading || !question.trim()}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border bg-black px-3 text-sm font-bold text-white transition hover:scale-[1.01] disabled:opacity-50 dark:bg-white dark:text-black"
                  >
                    <Send size={14} />
                    {labels.ask}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([
                      {
                        id: "welcome",
                        role: "assistant",
                        content:
                          locale === "ru"
                            ? "История очищена. Задай новый вопрос по NextLib."
                            : "History cleared. Ask a new question about NextLib.",
                      },
                    ]);
                  }}
                  className="mt-2 text-xs opacity-70 underline-offset-2 hover:underline"
                >
                  {labels.clear}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
