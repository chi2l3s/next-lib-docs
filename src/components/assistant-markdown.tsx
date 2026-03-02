"use client";

import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    if (match.index > last) {
      nodes.push(<span key={`${keyPrefix}_plain_${index}`}>{text.slice(last, match.index)}</span>);
      index += 1;
    }
    const token = match[0];

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}_strong_${index}`} className="font-extrabold">
          {token.slice(2, -2)}
        </strong>,
      );
      index += 1;
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={`${keyPrefix}_code_${index}`}
          className="rounded-md border px-1 py-0.5 text-[0.92em] bg-black/5 dark:bg-white/10"
        >
          {token.slice(1, -1)}
        </code>,
      );
      index += 1;
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        const [, label, href] = link;
        const external = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={`${keyPrefix}_link_${index}`}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            className="underline underline-offset-2"
          >
            {label}
          </a>,
        );
        index += 1;
      } else {
        nodes.push(<span key={`${keyPrefix}_raw_${index}`}>{token}</span>);
        index += 1;
      }
    } else {
      nodes.push(<span key={`${keyPrefix}_fallback_${index}`}>{token}</span>);
      index += 1;
    }

    last = regex.lastIndex;
  }

  if (last < text.length) {
    nodes.push(<span key={`${keyPrefix}_tail_${index}`}>{text.slice(last)}</span>);
  }
  return nodes;
}

function renderTextBlock(text: string, keyPrefix: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  const nodes: ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^- /, ""));
        i += 1;
      }
      nodes.push(
        <ul key={`${keyPrefix}_ul_${i}`} className="list-disc space-y-1 pl-5">
          {items.map((item, idx) => (
            <li key={`${keyPrefix}_uli_${idx}`}>{renderInline(item, `${keyPrefix}_uli_${idx}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      nodes.push(
        <ol key={`${keyPrefix}_ol_${i}`} className="list-decimal space-y-1 pl-5">
          {items.map((item, idx) => (
            <li key={`${keyPrefix}_oli_${idx}`}>{renderInline(item, `${keyPrefix}_oli_${idx}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      nodes.push(
        <p key={`${keyPrefix}_h_${i}`} className="text-[0.96rem] font-extrabold">
          {renderInline(line.replace(/^#{1,3}\s+/, ""), `${keyPrefix}_h_${i}`)}
        </p>,
      );
      i += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && !/^- /.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim()) && !/^#{1,3}\s+/.test(lines[i].trim())) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    nodes.push(
      <p key={`${keyPrefix}_p_${i}`} className="leading-relaxed">
        {renderInline(paragraph.join(" "), `${keyPrefix}_p_${i}`)}
      </p>,
    );
  }

  return <div className="space-y-2">{nodes}</div>;
}

export function AssistantMarkdown({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  const regex = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let blockIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content))) {
    if (match.index > lastIndex) {
      const textPart = content.slice(lastIndex, match.index).trim();
      if (textPart) blocks.push(renderTextBlock(textPart, `txt_${blockIndex}`));
      blockIndex += 1;
    }
    const language = (match[1] || "").trim();
    const code = match[2].replace(/\n$/, "");
    blocks.push(
      <div key={`code_${blockIndex}`} className="space-y-1">
        {language ? <p className="text-[11px] uppercase tracking-wide opacity-60">{language}</p> : null}
        <pre className="overflow-x-auto rounded-xl border bg-black p-3 text-[12px] text-white dark:bg-neutral-950">
          <code>{code}</code>
        </pre>
      </div>,
    );
    blockIndex += 1;
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    const tail = content.slice(lastIndex).trim();
    if (tail) blocks.push(renderTextBlock(tail, `txt_${blockIndex}`));
  }

  return <div className="assistant-markdown space-y-3 text-[13px]">{blocks}</div>;
}

