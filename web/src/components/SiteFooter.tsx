import { APP_META, SITE_LINKS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/[0.08] bg-[#f5f5f7]">
      <div className="mx-auto max-w-5xl px-5 py-10 text-xs text-muted-foreground sm:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-black/[0.06] pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-foreground">{APP_META.name}</p>
            <p className="mt-1">
              {APP_META.platform} · {APP_META.watchOsMin} · 当前处于 TestFlight 公测阶段
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <a
              href={SITE_LINKS.privacy}
              className="transition-colors hover:text-foreground"
            >
              隐私政策
            </a>
            <a
              href={SITE_LINKS.terms}
              className="transition-colors hover:text-foreground"
            >
              用户协议
            </a>
            <a
              href={SITE_LINKS.support}
              className="transition-colors hover:text-foreground"
            >
              技术支持
            </a>
            <a
              href={SITE_LINKS.github}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Tiltroom. 保留所有权利。</p>
          <p className="text-[11px] text-muted-foreground/80">
            Apple Watch、watchOS 与 TestFlight 均为 Apple Inc. 的注册商标。
          </p>
        </div>
      </div>
    </footer>
  );
}
