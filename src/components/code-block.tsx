"use client";

import { useMemo, useState } from "react";
import { isValidElement } from "react";
import type { HTMLAttributes, ReactNode } from "react";

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

export function CodeBlock(props: HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    return extractText(props.children).replace(/\n$/, "");
  }, [props.children]);

  return (
    <div className="code-wrapper">
      <button
        type="button"
        className="copy-button"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre {...props} />
    </div>
  );
}
