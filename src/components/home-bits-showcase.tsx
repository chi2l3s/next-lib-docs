"use client";

import { useRouter } from "next/navigation";
import LogoLoop from "@/components/LogoLoop";
import TiltedCard from "@/components/TiltedCard";
import AnimatedList from "@/components/AnimatedList";
import FlowingMenu from "@/components/FlowingMenu";
import { Link } from "@/i18n/navigation";

type Card = {
  title: string;
  text: string;
  href: string;
};

export function HomeBitsShowcase({
  locale,
  title,
  description,
  cards,
}: {
  locale: "ru" | "en";
  title: string;
  description: string;
  cards: Card[];
}) {
  const router = useRouter();

  return (
    <section className="mx-auto max-w-6xl pb-10">
      <div className="rounded-3xl border surface p-8 sm:p-10 shadow-sm">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg font-semibold opacity-90">{description}</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-2xl border surface p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h2 className="text-xl font-extrabold">{card.title}</h2>
                <p className="mt-3 text-base font-semibold opacity-85">{card.text}</p>
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border surface p-5">
            <TiltedCard
              altText="NextLib"
              captionText={locale === "ru" ? "Архитектура модулей" : "Module architecture"}
              containerHeight="300px"
              imageHeight="220px"
              imageWidth="100%"
              scaleOnHover={1.03}
              rotateAmplitude={9}
              showMobileWarning={false}
              showTooltip={true}
              renderContent={<span>NEXTLIB CORE</span>}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border surface p-5 shadow-sm">
        <LogoLoop
          speed={62}
          logoHeight={30}
          gap={20}
          fadeOut={true}
          logos={[
            { node: <span className="rounded-xl border px-4 py-2 text-sm font-extrabold">Dynamic Database</span> },
            { node: <span className="rounded-xl border px-4 py-2 text-sm font-extrabold">GUI API</span> },
            { node: <span className="rounded-xl border px-4 py-2 text-sm font-extrabold">Command API</span> },
            { node: <span className="rounded-xl border px-4 py-2 text-sm font-extrabold">Item API</span> },
            { node: <span className="rounded-xl border px-4 py-2 text-sm font-extrabold">Color API</span> },
            { node: <span className="rounded-xl border px-4 py-2 text-sm font-extrabold">Config Manager</span> },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border surface p-5 shadow-sm">
          <AnimatedList
            className="!w-full max-w-none"
            itemClassName="!rounded-xl !bg-transparent border font-bold"
            displayScrollbar={false}
            items={cards.map((card) => `${card.title} - ${card.text}`)}
            onItemSelect={(_, index) => {
              const card = cards[index];
              if (card) router.push(`/${locale}${card.href}`);
            }}
          />
        </div>

        <div className="overflow-hidden rounded-3xl border shadow-sm">
          <div className="h-[420px]">
            <FlowingMenu
              speed={18}
              bgColor="#000000"
              textColor="#ffffff"
              marqueeBgColor="#ffffff"
              marqueeTextColor="#000000"
              borderColor="#ffffff"
              items={[
                { link: `/${locale}/docs/modules/dynamic-database`, text: "Dynamic Database" },
                { link: `/${locale}/docs/modules/gui-api`, text: "GUI API" },
                { link: `/${locale}/docs/modules/command-api`, text: "Command API" },
                { link: `/${locale}/docs/troubleshooting`, text: "Troubleshooting" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
