const GITHUB_API = "https://api.github.com";
const OWNER = "chi2l3s";
const REPO = "next-lib";

type RepoResponse = {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
  language: string | null;
  pushed_at: string;
  html_url: string;
};

type ReleaseResponse = {
  name: string | null;
  tag_name: string;
  published_at: string;
  html_url: string;
};

type ContributorResponse = {
  login: string;
  contributions: number;
  html_url: string;
};

type ReleaseListResponse = {
  name: string | null;
  tag_name: string;
  published_at: string;
  html_url: string;
  body: string | null;
};

export type GithubLandingData = {
  stars: number;
  forks: number;
  issues: number;
  watchers: number;
  language: string;
  lastPushAt: string;
  repoUrl: string;
  latestRelease: {
    name: string;
    publishedAt: string;
    url: string;
  } | null;
  contributors: Array<{
    login: string;
    contributions: number;
    url: string;
  }>;
};

export type GithubReleaseItem = {
  name: string;
  tag: string;
  publishedAt: string;
  url: string;
  body: string;
  module: "database" | "gui" | "command" | "item" | "color" | "config" | "core";
  type: "feature" | "fix" | "docs" | "breaking" | "chore";
};

function headers() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "nextlib-docs",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: headers(),
      next: { revalidate: 1800 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getGithubLandingData(): Promise<GithubLandingData> {
  const [repo, release, contributors] = await Promise.all([
    fetchJson<RepoResponse>(`${GITHUB_API}/repos/${OWNER}/${REPO}`),
    fetchJson<ReleaseResponse>(`${GITHUB_API}/repos/${OWNER}/${REPO}/releases/latest`),
    fetchJson<ContributorResponse[]>(`${GITHUB_API}/repos/${OWNER}/${REPO}/contributors?per_page=5`),
  ]);

  return {
    stars: repo?.stargazers_count ?? 0,
    forks: repo?.forks_count ?? 0,
    issues: repo?.open_issues_count ?? 0,
    watchers: repo?.subscribers_count ?? 0,
    language: repo?.language ?? "Java",
    lastPushAt: repo?.pushed_at ?? new Date().toISOString(),
    repoUrl: repo?.html_url ?? `https://github.com/${OWNER}/${REPO}`,
    latestRelease: release
      ? {
          name: release.name ?? release.tag_name,
          publishedAt: release.published_at,
          url: release.html_url,
        }
      : null,
    contributors: (contributors ?? []).map((item) => ({
      login: item.login,
      contributions: item.contributions,
      url: item.html_url,
    })),
  };
}

function classifyModule(body: string): GithubReleaseItem["module"] {
  const text = body.toLowerCase();
  if (text.includes("database") || text.includes("sql") || text.includes("hikari")) return "database";
  if (text.includes("gui") || text.includes("menu")) return "gui";
  if (text.includes("command") || text.includes("subcommand")) return "command";
  if (text.includes("item") || text.includes("pdc") || text.includes("persistentdata")) return "item";
  if (text.includes("color") || text.includes("hex")) return "color";
  if (text.includes("config") || text.includes("yaml")) return "config";
  return "core";
}

function classifyType(body: string): GithubReleaseItem["type"] {
  const text = body.toLowerCase();
  if (text.includes("breaking")) return "breaking";
  if (text.includes("fix") || text.includes("bug")) return "fix";
  if (text.includes("docs") || text.includes("readme")) return "docs";
  if (text.includes("feature") || text.includes("add")) return "feature";
  return "chore";
}

export async function getGithubReleases(limit = 20): Promise<GithubReleaseItem[]> {
  const raw = await fetchJson<ReleaseListResponse[]>(
    `${GITHUB_API}/repos/${OWNER}/${REPO}/releases?per_page=${limit}`,
  );
  if (!raw) return [];
  return raw.map((release) => {
    const body = release.body ?? "";
    return {
      name: release.name ?? release.tag_name,
      tag: release.tag_name,
      publishedAt: release.published_at,
      url: release.html_url,
      body,
      module: classifyModule(body),
      type: classifyType(body),
    };
  });
}
