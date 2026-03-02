import { Link } from "@/i18n/navigation";

type Item = {
  title: string;
  href: string;
};

export function PagerNav({
  prev,
  next,
  labels,
}: {
  prev?: Item;
  next?: Item;
  labels: { previous: string; next: string };
}) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-10 grid gap-3 border-t pt-5 sm:grid-cols-2">
      <div>
        {prev ? (
          <Link href={prev.href} className="block rounded-lg border p-3 hover:bg-black/5 dark:hover:bg-white/5">
            <div className="text-xs opacity-70">{labels.previous}</div>
            <div className="font-medium">{prev.title}</div>
          </Link>
        ) : null}
      </div>
      <div>
        {next ? (
          <Link href={next.href} className="block rounded-lg border p-3 text-right hover:bg-black/5 dark:hover:bg-white/5">
            <div className="text-xs opacity-70">{labels.next}</div>
            <div className="font-medium">{next.title}</div>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
