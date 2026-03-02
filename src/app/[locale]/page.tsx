import type { Metadata } from "next";
import { Activity, ArrowRight, Database, LayoutDashboard, TerminalSquare } from "lucide-react";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getGithubLandingData } from "@/lib/github";
import { LandingPlayground } from "@/components/landing-playground";

const homeCopy: Record<
  AppLocale,
  {
    title: string;
    subtitle: string;
    description: string;
    ctaDocs: string;
    ctaInstall: string;
    statsTitle: string;
    modulesTitle: string;
    installTitle: string;
    releaseTitle: string;
    contributorsTitle: string;
    pushedLabel: string;
    compatibilityTitle: string;
    playgroundTitle: string;
    timelineTitle: string;
    cards: Array<{ title: string; text: string; href: string; icon: "db" | "gui" | "cmd" }>;
  }
> = {
  ru: {
    title: "NextLib",
    subtitle: "Paper/Spigot Toolkit",
    description:
      "Полноценная библиотека для плагинов: Dynamic Database, GUI API, Command API, Item API, Color API и Config Manager.",
    ctaDocs: "Открыть документацию",
    ctaInstall: "Установка",
    statsTitle: "Live GitHub API",
    modulesTitle: "Ключевые модули",
    installTitle: "Установка за 30 секунд",
    releaseTitle: "Последний релиз",
    contributorsTitle: "Топ контрибьюторы",
    pushedLabel: "Последний push",
    compatibilityTitle: "Совместимость",
    playgroundTitle: "Playground",
    timelineTitle: "Changelog Timeline",
    cards: [
      { title: "Dynamic Database", text: "Fluent CRUD, операторы, HikariCP, MySQL/PostgreSQL/SQLite.", href: "/docs/modules/dynamic-database", icon: "db" },
      { title: "GUI API", text: "YAML-меню, действия, условия и конфигурируемые слоты.", href: "/docs/modules/gui-api", icon: "gui" },
      { title: "Command API", text: "Сабкоманды, алиасы и контролируемый tab-completion.", href: "/docs/modules/command-api", icon: "cmd" },
    ],
  },
  en: {
    title: "NextLib",
    subtitle: "Paper/Spigot Toolkit",
    description:
      "A complete plugin library: Dynamic Database, GUI API, Command API, Item API, Color API and Config Manager.",
    ctaDocs: "Open docs",
    ctaInstall: "Installation",
    statsTitle: "Live GitHub API",
    modulesTitle: "Core modules",
    installTitle: "Install in 30 seconds",
    releaseTitle: "Latest release",
    contributorsTitle: "Top contributors",
    pushedLabel: "Last push",
    compatibilityTitle: "Compatibility",
    playgroundTitle: "Playground",
    timelineTitle: "Changelog Timeline",
    cards: [
      { title: "Dynamic Database", text: "Fluent CRUD, operators, HikariCP, MySQL/PostgreSQL/SQLite.", href: "/docs/modules/dynamic-database", icon: "db" },
      { title: "GUI API", text: "YAML menus, actions, conditions and configurable slots.", href: "/docs/modules/gui-api", icon: "gui" },
      { title: "Command API", text: "Subcommands, aliases and controlled tab-completion.", href: "/docs/modules/command-api", icon: "cmd" },
    ],
  },
};

function formatDate(value: string, locale: AppLocale) {
  const d = new Date(value);
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function formatNumber(value: number, locale: AppLocale) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US").format(value);
}

function CardIcon({ icon }: { icon: "db" | "gui" | "cmd" }) {
  if (icon === "db") return <Database size={20} />;
  if (icon === "gui") return <LayoutDashboard size={20} />;
  return <TerminalSquare size={20} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const copy = homeCopy[locale as AppLocale];
  return {
    title: `${copy.title} — ${copy.subtitle}`,
    description: copy.description,
  };
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const typedLocale = locale as AppLocale;
  const copy = homeCopy[typedLocale];
  const github = await getGithubLandingData();

  return (
    <section className="mx-auto max-w-6xl pb-10">
      <div className="rounded-3xl border surface p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{copy.subtitle}</p>
        <h1 className="mt-3 text-5xl font-extrabold tracking-tight">{copy.title}</h1>
        <p className="mt-4 max-w-3xl text-lg font-medium opacity-90">{copy.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/docs" className="inline-flex items-center gap-2 rounded-xl border bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">
            {copy.ctaDocs}
            <ArrowRight size={16} />
          </Link>
          <Link href="/docs/installation" className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold">
            {copy.ctaInstall}
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border surface p-6">
        <h2 className="mb-4 text-2xl font-bold">{copy.statsTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border p-4">
            <div className="text-xs opacity-70">Stars</div>
            <div className="text-2xl font-bold">{formatNumber(github.stars, typedLocale)}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs opacity-70">Forks</div>
            <div className="text-2xl font-bold">{formatNumber(github.forks, typedLocale)}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs opacity-70">Open Issues</div>
            <div className="text-2xl font-bold">{formatNumber(github.issues, typedLocale)}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs opacity-70">Watchers</div>
            <div className="text-2xl font-bold">{formatNumber(github.watchers, typedLocale)}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs opacity-70">{copy.pushedLabel}</div>
            <div className="text-lg font-bold">{formatDate(github.lastPushAt, typedLocale)}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border surface p-6">
        <h2 className="mb-4 text-2xl font-bold">{copy.modulesTitle}</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {copy.cards.map((card) => (
            <Link key={card.href} href={card.href} className="rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 inline-flex rounded-xl border p-2">
                <CardIcon icon={card.icon} />
              </div>
              <h3 className="text-xl font-bold">{card.title}</h3>
              <p className="mt-2 text-sm opacity-80">{card.text}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border surface p-6">
          <h2 className="text-2xl font-bold">{copy.installTitle}</h2>
          <pre className="mt-4 overflow-x-auto rounded-xl border p-4 text-xs">
{`repositories {
  mavenCentral()
  maven("https://jitpack.io")
}

dependencies {
  implementation("com.github.chi2l3s:next-lib:1.0.7")
}`}
          </pre>
          <a
            href={github.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
          >
            <Activity size={16} />
            GitHub Repository
          </a>
        </div>

        <div className="rounded-3xl border surface p-6">
          <h2 className="text-2xl font-bold">{copy.releaseTitle}</h2>
          {github.latestRelease ? (
            <div className="mt-4 rounded-xl border p-4">
              <div className="text-lg font-bold">{github.latestRelease.name}</div>
              <div className="mt-1 text-sm opacity-70">{formatDate(github.latestRelease.publishedAt, typedLocale)}</div>
              <a
                href={github.latestRelease.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
              >
                View release
                <ArrowRight size={14} />
              </a>
            </div>
          ) : (
            <div className="mt-4 text-sm opacity-70">No release data.</div>
          )}

          <h3 className="mt-6 text-lg font-bold">{copy.contributorsTitle}</h3>
          <div className="mt-3 space-y-2">
            {github.contributors.map((contributor) => (
              <a
                key={contributor.login}
                href={contributor.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
              >
                <span>@{contributor.login}</span>
                <span className="font-semibold">{contributor.contributions}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border surface p-6">
          <h2 className="text-2xl font-bold">{copy.compatibilityTitle}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Target</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Java 17+</td>
                  <td className="py-2 font-semibold">Supported</td>
                  <td className="py-2">Production baseline</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Paper/Spigot API</td>
                  <td className="py-2 font-semibold">Supported</td>
                  <td className="py-2">Core module target</td>
                </tr>
                <tr>
                  <td className="py-2">MySQL/PostgreSQL/SQLite</td>
                  <td className="py-2 font-semibold">Supported</td>
                  <td className="py-2">Dynamic Database + HikariCP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <LandingPlayground title={copy.playgroundTitle} />
      </div>

      <div className="mt-6 rounded-3xl border surface p-6">
        <h2 className="text-2xl font-bold">{copy.timelineTitle}</h2>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="rounded-xl border p-3">
            <div className="font-semibold">v1.0.7</div>
            <div className="opacity-80">Advanced query operators and improved docs.</div>
          </li>
          <li className="rounded-xl border p-3">
            <div className="font-semibold">v1.0.6</div>
            <div className="opacity-80">Hikari configuration builder improvements.</div>
          </li>
          <li className="rounded-xl border p-3">
            <div className="font-semibold">v1.0.0+</div>
            <div className="opacity-80">Initial modular APIs: command, item, color, config, GUI.</div>
          </li>
        </ol>
      </div>
    </section>
  );
}
