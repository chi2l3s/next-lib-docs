import fs from "node:fs";
import path from "node:path";

export type ApiMethod = {
  name: string;
  signature: string;
  summary: string;
  params: Array<{
    name: string;
    type: string;
    description: string;
  }>;
};

export type ApiClass = {
  packageName: string;
  name: string;
  kind: "class" | "interface" | "enum";
  summary: string;
  methods: ApiMethod[];
  sourceFile: string;
};

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(p));
      continue;
    }
    if (entry.name.endsWith(".java")) files.push(p);
  }
  return files;
}

function cleanJavadoc(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter((line) => line.length > 0 && !line.startsWith("@"))
    .join(" ")
    .trim();
}

function parseJavadocDetails(raw: string) {
  const lines = raw
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter((line) => line.length > 0);

  const summaryParts: string[] = [];
  const paramMap = new Map<string, string>();
  let activeParam: string | null = null;

  for (const line of lines) {
    if (line.startsWith("@param")) {
      const match = /^@param\s+([A-Za-z0-9_]+)\s*(.*)$/.exec(line);
      if (!match) continue;
      const [, paramName, desc] = match;
      activeParam = paramName;
      paramMap.set(paramName, desc?.trim() ?? "");
      continue;
    }
    if (line.startsWith("@")) {
      activeParam = null;
      continue;
    }
    if (activeParam) {
      const prev = paramMap.get(activeParam) ?? "";
      paramMap.set(activeParam, `${prev} ${line}`.trim());
      continue;
    }
    summaryParts.push(line);
  }

  return {
    summary: summaryParts.join(" ").trim(),
    paramMap,
  };
}

function parseParamsFromSignature(argsRaw: string) {
  const args = argsRaw.trim();
  if (!args) return [];
  return args
    .split(",")
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      const tokens = raw.split(/\s+/).filter(Boolean);
      const name = tokens[tokens.length - 1] ?? raw;
      const type = tokens.slice(0, -1).join(" ") || "unknown";
      return { name, type };
    });
}

function parseMethods(content: string): ApiMethod[] {
  const methods: ApiMethod[] = [];
  const methodRegex =
    /\/\*\*([\s\S]*?)\*\/\s*public\s+(?:static\s+|final\s+|default\s+|synchronized\s+|abstract\s+)*([A-Za-z0-9_<>,\[\]\.? ]+?)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = methodRegex.exec(content))) {
    const details = parseJavadocDetails(match[1]);
    const returnType = match[2].replace(/\s+/g, " ").trim();
    const name = match[3];
    const args = match[4].replace(/\s+/g, " ").trim();
    const params = parseParamsFromSignature(args).map((param) => ({
      ...param,
      description: details.paramMap.get(param.name) ?? "",
    }));
    methods.push({
      name,
      summary: details.summary,
      signature: `${returnType} ${name}(${args})`,
      params,
    });
  }
  return methods.slice(0, 25);
}

function parseClass(filePath: string): ApiClass | null {
  const content = fs.readFileSync(filePath, "utf8");
  const packageMatch = /^package\s+([^;]+);/m.exec(content);
  if (!packageMatch) return null;
  const packageName = packageMatch[1];
  if (!packageName.includes(".api.")) return null;

  const classRegex =
    /\/\*\*([\s\S]*?)\*\/\s*public\s+(?:final\s+|abstract\s+)?(class|interface|enum)\s+([A-Za-z0-9_]+)/m;
  const classMatch = classRegex.exec(content);
  if (!classMatch) return null;

  const summary = cleanJavadoc(classMatch[1]);
  const kind = classMatch[2] as ApiClass["kind"];
  const name = classMatch[3];
  const methods = parseMethods(content);

  return {
    packageName,
    name,
    kind,
    summary,
    methods,
    sourceFile: filePath,
  };
}

export function getApiReferenceData(): ApiClass[] {
  const root = path.join(process.cwd(), "..", "next-lib-source", "src", "main", "java");
  if (!fs.existsSync(root)) return [];
  const result = walk(root)
    .map(parseClass)
    .filter((item): item is ApiClass => Boolean(item))
    .sort((a, b) => a.packageName.localeCompare(b.packageName) || a.name.localeCompare(b.name));
  return result.slice(0, 120);
}
