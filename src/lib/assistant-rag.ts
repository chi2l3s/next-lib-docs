import type { AppLocale } from "@/i18n/routing";
import { getAllDocs, getDoc } from "@/lib/content";
import { getApiReferenceData } from "@/lib/apiref";

type ChunkSource = {
  title: string;
  href: string;
};

export type KnowledgeChunk = {
  id: string;
  locale: AppLocale;
  source: ChunkSource;
  text: string;
  normalized: string;
};

export type RetrievedChunk = KnowledgeChunk & {
  score: number;
};

const KB_CACHE = new Map<AppLocale, KnowledgeChunk[]>();

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[>*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string) {
  const stopwords = new Set([
    "и",
    "в",
    "на",
    "с",
    "по",
    "что",
    "как",
    "если",
    "или",
    "у",
    "для",
    "это",
    "the",
    "and",
    "for",
    "with",
    "what",
    "how",
    "when",
    "where",
    "why",
    "can",
    "does",
    "this",
    "that",
  ]);

  return Array.from(
    new Set(
      normalize(input)
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token.length >= 2 && !stopwords.has(token)),
    ),
  );
}

function expandQueryTokens(tokens: string[]) {
  const expanded = new Set(tokens);
  const joined = tokens.join(" ");

  if (/(баз|database|jdbc|mysql|postgres|sqlite|hikari|sql|таблиц|transaction)/.test(joined)) {
    ["database", "jdbc", "mysql", "postgresql", "sqlite", "hikari", "transaction", "query", "where"].forEach((t) =>
      expanded.add(t),
    );
    ["база", "данных", "таблица", "транзакция", "индекс", "запрос"].forEach((t) => expanded.add(t));
  }
  if (/(gui|menu|меню|клик|action|condition|slot)/.test(joined)) {
    ["gui", "menu", "action", "condition", "slot", "visible_when", "on_left_click"].forEach((t) => expanded.add(t));
    ["меню", "условие", "действие", "слот"].forEach((t) => expanded.add(t));
  }
  if (/(item|предмет|pdc|lore|enchant)/.test(joined)) {
    ["item", "pdc", "lore", "enchant", "itembuilder", "persistentdata"].forEach((t) => expanded.add(t));
  }

  return Array.from(expanded);
}

function toChunks(text: string, size = 700): string[] {
  const paragraphs = text.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buffer = "";

  for (const paragraph of paragraphs) {
    if (!buffer) {
      buffer = paragraph;
      continue;
    }
    if ((buffer + "\n\n" + paragraph).length <= size) {
      buffer = `${buffer}\n\n${paragraph}`;
      continue;
    }
    chunks.push(buffer);
    buffer = paragraph;
  }
  if (buffer) chunks.push(buffer);
  return chunks.length ? chunks : [text];
}

function buildDocsChunks(locale: AppLocale): KnowledgeChunk[] {
  const docs = getAllDocs(locale);
  const chunks: KnowledgeChunk[] = [];

  for (const docMeta of docs) {
    const doc = getDoc(locale, docMeta.slug);
    if (!doc) continue;
    const plain = stripMarkdown(doc.body);
    const docChunks = toChunks(plain);
    for (let i = 0; i < docChunks.length; i += 1) {
      const text = docChunks[i];
      chunks.push({
        id: `${docMeta.slugKey}:${i}`,
        locale,
        source: { title: doc.title, href: doc.href },
        text,
        normalized: normalize(`${doc.title} ${text}`),
      });
    }
  }

  return chunks;
}

function buildApiChunks(locale: AppLocale): KnowledgeChunk[] {
  const titlePrefix = locale === "ru" ? "API справка" : "API Reference";
  return getApiReferenceData()
    .flatMap((item) =>
      item.methods.slice(0, 12).map((method, index) => {
        const text = `${item.kind} ${item.name} (${item.packageName}). ${method.signature}. ${method.summary}`;
        return {
          id: `api:${item.packageName}.${item.name}:${index}`,
          locale,
          source: { title: `${titlePrefix}: ${item.name}`, href: "/docs/api-reference" },
          text,
          normalized: normalize(text),
        };
      }),
    )
    .slice(0, 400);
}

export function getKnowledgeBase(locale: AppLocale) {
  const cached = KB_CACHE.get(locale);
  if (cached) return cached;
  const combined = [...buildDocsChunks(locale), ...buildApiChunks(locale)];
  KB_CACHE.set(locale, combined);
  return combined;
}

export function retrieveRelevantChunks(locale: AppLocale, question: string, limit = 6): RetrievedChunk[] {
  const kb = getKnowledgeBase(locale);
  const queryTokens = expandQueryTokens(tokenize(question));
  if (!queryTokens.length) return [];
  const normalizedQuestion = normalize(question);

  const scored: RetrievedChunk[] = [];
  for (const chunk of kb) {
    let score = 0;
    let matchedTokens = 0;
    for (const token of queryTokens) {
      if (chunk.normalized.includes(token)) {
        score += 1;
        matchedTokens += 1;
      }
      if (chunk.source.title.toLowerCase().includes(token)) {
        score += 2;
      }
    }
    if (normalizedQuestion.length > 8 && chunk.normalized.includes(normalizedQuestion)) {
      score += 6;
    }
    if (/(database|база|sql|jdbc|mysql|postgres|sqlite|hikari)/.test(normalizedQuestion)) {
      if (chunk.source.href.includes("dynamic-database")) score += 6;
      if (chunk.source.href.includes("troubleshooting")) score += 3;
      if (chunk.source.href.includes("item-api") || chunk.source.href.includes("gui-api")) score -= 2;
    }
    if (score > 0 && matchedTokens >= 2) {
      scored.push({ ...chunk, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
