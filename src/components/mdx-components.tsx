import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { Link2 } from "lucide-react";
import { CodeBlock } from "./code-block";

function Alert({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "note" | "warning";
}) {
  const cls =
    tone === "note"
      ? "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-100"
      : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100";
  return <div className={`my-4 rounded-lg border p-3 text-sm ${cls}`}>{children}</div>;
}

export const mdxComponents: MDXComponents = {
  pre: (props) => <CodeBlock {...props} />,
  Note: ({ children }) => <Alert tone="note">{children}</Alert>,
  Warning: ({ children }) => <Alert tone="warning">{children}</Alert>,
  h2: ({ children }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }) => <Heading level={3}>{children}</Heading>,
  a: (props) => (
    <a
      {...props}
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noreferrer" : undefined}
    />
  ),
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function textFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textFromNode((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

function Heading({ level, children }: { level: 2 | 3; children: ReactNode }) {
  const text = textFromNode(children);
  const id = slugify(text);
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={id} className="group scroll-mt-28">
      <a href={`#${id}`} className="no-underline">
        {children}
      </a>
      <a
        href={`#${id}`}
        aria-label="Copy link"
        className="ml-2 inline-flex opacity-0 transition group-hover:opacity-70"
      >
        <Link2 size={14} />
      </a>
    </Tag>
  );
}
