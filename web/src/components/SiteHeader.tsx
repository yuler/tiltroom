import { ArrowUpRight } from "lucide-react";
import { APP_META, SITE_LINKS } from "@/lib/constants";

interface SiteHeaderProps {
  isSubpage?: boolean;
}

export function SiteHeader({ isSubpage = false }: SiteHeaderProps) {
  const navItems = [
    { label: "交互试玩", href: isSubpage ? "/#demo" : "#demo" },
    { label: "重力快门", href: isSubpage ? "/#mechanic" : "#mechanic" },
    { label: "核心特性", href: isSubpage ? "/#features" : "#features" },
    { label: "安装指南", href: isSubpage ? "/#install" : "#install" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#f5f5f7]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-8">
        <a
          href="/"
          className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#14110e] shadow-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e7c27a]" />
          </span>
          <span className="text-[17px] font-bold tracking-tight">
            {APP_META.name}
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-xs font-medium text-muted-foreground md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={SITE_LINKS.testflight}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-[#0077ed]"
        >
          <span>加入 TestFlight</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}
