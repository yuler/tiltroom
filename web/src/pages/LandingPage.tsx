import {
  Aperture,
  ArrowUpRight,
  Compass,
  Hand,
  Layers,
  QrCode,
  ShieldCheck,
  Smartphone,
  Watch,
} from "lucide-react";
import { InteractiveWatchDemo } from "@/components/InteractiveWatchDemo";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TestFlightQr } from "@/components/TestFlightQr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APP_META, SITE_LINKS } from "@/lib/constants";

const MECHANISM_ITEMS = [
  {
    name: "弹珠",
    desc: "暖金弹珠随重力一路滑行至撞墙停下，拾取钥匙后内圈亮起光环。",
    swatch: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 rounded-xl" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#1e1b17" />
        <circle cx="16" cy="16" r="8.5" fill="#e7c27a" />
        <circle cx="16" cy="16" r="4.5" fill="none" stroke="#fff4d2" strokeWidth="2.2" />
      </svg>
    ),
  },
  {
    name: "钥匙",
    desc: "弹珠滑过即自动拾取，随即点亮并解锁本关大门。",
    swatch: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 rounded-xl" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#1e1b17" />
        <circle cx="12.5" cy="12" r="3.8" fill="none" stroke="#e7c27a" strokeWidth="2.3" />
        <path
          d="M15.6 15.1L22.5 22M19 18.6L22 17"
          stroke="#e7c27a"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "大门",
    desc: "未持钥匙时如同墙壁阻挡滑行；拾取钥匙后亮金开启。",
    swatch: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 rounded-xl" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#1e1b17" />
        <rect x="9" y="5.5" width="14" height="21" rx="3" fill="#d7b56a" />
        <circle cx="16" cy="15.5" r="2.2" fill="#19140d" />
      </svg>
    ),
  },
  {
    name: "黑洞",
    desc: "带红橙警示环的深坑，弹珠滑入即失败；需要绕行或借木箱填坑。",
    swatch: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 rounded-xl" aria-hidden="true">
        <defs>
          <radialGradient id="hole-pit" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="100%" stopColor="#38130e" />
          </radialGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="#1e1b17" />
        <circle
          cx="16"
          cy="16"
          r="8.8"
          fill="url(#hole-pit)"
          stroke="#e06b47"
          strokeWidth="2.4"
        />
      </svg>
    ),
  },
  {
    name: "木箱",
    desc: "与弹珠同步受重力滑行，既能当挡板卡位，也能落洞消障。",
    swatch: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 rounded-xl" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#1e1b17" />
        <rect
          x="6.5"
          y="6.5"
          width="19"
          height="19"
          rx="3"
          fill="#8b5a32"
          stroke="#ad7847"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    name: "墙壁",
    desc: "构成方格迷宫骨架，规划最少步数（Par）的停靠支点。",
    swatch: (
      <svg viewBox="0 0 32 32" className="h-8 w-8 rounded-xl" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#413b32" />
        <rect x="2" y="2" width="28" height="3" rx="1.5" fill="#574d41" fillOpacity="0.85" />
      </svg>
    ),
  },
];

const INSTALL_STEPS = [
  {
    step: "01",
    title: "在 iPhone 安装 TestFlight",
    desc: "如尚未安装，请先在 App Store 免费下载 Apple 官方 TestFlight 应用。",
  },
  {
    step: "02",
    title: "打开 Tiltroom 邀请链接",
    desc: "点击本页「加入 TestFlight」按钮，或用 iPhone 相机直接扫描右侧二维码。",
  },
  {
    step: "03",
    title: "直接安装到 Apple Watch",
    desc: "作为 Watch-only 独立应用，确认接受测试后即可自动推送到你的手表开玩。",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-foreground">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl px-5 pt-14 pb-16 sm:px-8 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="default">TestFlight 公测中 · 即将登陆 App Store</Badge>
              <Badge variant="neutral">
                <Watch className="h-3.5 w-3.5" />
                Watch-only 独立应用
              </Badge>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl sm:leading-[1.08]">
              抬腕瞄准，
              <span className="text-muted-foreground">快门落定。</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-xl sm:leading-8">
              Tiltroom 是一款专为 Apple Watch 打造的独立倾斜解谜游戏。独创
              <strong className="font-semibold text-foreground">「重力快门」</strong>
              两步操控，先侧腕选定重力方向，再轻点表盘释放滑落——在方寸屏幕间体验恰到好处的机械手感。
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={SITE_LINKS.testflight}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-[#0077ed] active:scale-[0.98]"
              >
                <span>通过 TestFlight 抢先体验</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <Dialog>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="lg">
                      <QrCode className="h-4 w-4" />
                      <span>iPhone 扫码安装</span>
                    </Button>
                  }
                />
                <DialogContent className="text-center">
                  <DialogTitle>扫码加入 TestFlight 公测</DialogTitle>
                  <DialogDescription>
                    使用 iPhone 相机扫描下方二维码，接受邀请后将自动安装到已配对的 Apple Watch。
                  </DialogDescription>
                  <div className="mt-6 flex justify-center">
                    <TestFlightQr url={SITE_LINKS.testflight} size={184} />
                  </div>
                  <a
                    href={SITE_LINKS.testflight}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>直接打开邀请链接</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Interactive Apple Watch + Right-side Gyroscope Demo */}
          <div id="demo" className="mt-12 scroll-mt-20">
            <InteractiveWatchDemo />
          </div>
        </section>

        {/* PV Section: Gravity Shutter Two-Step Mechanic */}
        <section
          id="mechanic"
          className="scroll-mt-20 border-y border-black/[0.06] bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                GRAVITY SHUTTER
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                为什么是「重力快门」，而不是实时倾倒？
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                在手腕上玩实时倾斜游戏，稍微换个坐姿就会误触滑飞。Tiltroom 将重力解谜拆成清晰可控的两步，让每一次决策都干脆利落。
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Card className="bg-[#f5f5f7]/70 shadow-none">
                <CardContent className="flex h-full flex-col justify-between p-8">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d1d1f] text-[#e7c27a]">
                      <Compass className="h-6 w-6" />
                    </div>
                    <p className="mt-6 text-xs font-semibold tracking-wider text-muted-foreground">
                      STEP 01 · 倾腕瞄准
                    </p>
                    <h3 className="mt-1.5 text-2xl font-bold tracking-tight">
                      手腕微侧，方向先亮
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      手表实时感知哪一条表盘边缘更朝下，并在屏幕边缘点亮暖金方向指示。你可以从容观察棋盘路线、确认落点，此时棋盘上的弹珠与木箱纹丝不动。
                    </p>
                  </div>
                  <div className="mt-6 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-xs text-muted-foreground">
                    腕部放平时自动进入安全死区，误点屏幕不会触发滑落。
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#14110e] text-white shadow-lg">
                <CardContent className="flex h-full flex-col justify-between p-8">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7c27a] text-[#14110e]">
                      <Aperture className="h-6 w-6" />
                    </div>
                    <p className="mt-6 text-xs font-semibold tracking-wider text-[#e7c27a]">
                      STEP 02 · 快门释放
                    </p>
                    <h3 className="mt-1.5 text-2xl font-bold tracking-tight">
                      轻点表盘，一滑到底
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/72">
                      确认方向后轻点表盘按下「快门」，弹珠与木箱立刻沿 4 向离散格干脆滑落，配合 Apple Watch 触感反馈，每一步撞墙与开门都清晰可感。
                    </p>
                  </div>
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs text-white/75">
                    也支持在表盘上直接向四向滑动（Swipe），单手通勤同样顺畅。
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                FEATURES
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                为 Apple Watch 而生，不多一分冗余。
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                纯粹的 watchOS 原生体验：打开即玩、随时暂停，不依赖手机、不弹窗打扰。
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-6">
              {/* Large Card 1: 6 Puzzle Elements */}
              <Card className="md:col-span-4">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Layers className="h-4 w-4" />
                    <span>6 种核心机关</span>
                  </div>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">
                    规则一眼看懂，组合层层递进
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    全游戏仅由 6 种高对比度视觉元素组成，在小尺寸 OLED 表盘上依然清晰锐利。
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {MECHANISM_ITEMS.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-start gap-3 rounded-2xl bg-[#f5f5f7] p-3.5"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-2xs">
                          {item.swatch}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tall Card 2: Watch-only */}
              <Card className="md:col-span-2">
                <CardContent className="flex h-full flex-col justify-between p-8">
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Watch className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold tracking-tight">
                      Watch-only 独立运行
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      没有多余的 iPhone 伴侣端。安装、游玩与通关最佳步数存档全部留在 Apple Watch 本地，抬腕 30 秒就能解完一关。
                    </p>
                  </div>
                  <div className="mt-6 border-t border-border/80 pt-4 text-xs font-medium text-muted-foreground">
                    兼容 {APP_META.watchOsMin}
                  </div>
                </CardContent>
              </Card>

              {/* Bottom 3 Compact Bento Cards */}
              <Card className="md:col-span-2">
                <CardContent className="p-7">
                  <p className="text-4xl font-bold tracking-tight text-foreground">
                    {APP_META.totalLevels} 关
                  </p>
                  <h3 className="mt-2 text-base font-bold">手工打磨解谜关卡</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    从 1 步直走入门到 14 步多箱联动的烧脑谜题，每关均设有最佳步数（Par）挑战。
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="p-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-foreground">
                    <Hand className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold">表盘直滑兜底操作</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    除手腕倾斜瞄准外，亦保留表盘四向直接滑动（Swipe），躺在沙发上也能轻松单指通关。
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="p-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold">纯本地 · 零数据收集</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    无账号登录、无广告、无第三方追踪 SDK。所有进度仅存储在你的手表设备中。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Bottom TestFlight CTA Banner */}
        <section id="install" className="scroll-mt-20 pb-20 sm:pb-24">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="overflow-hidden rounded-[36px] bg-[#1d1d1f] p-8 text-white shadow-xl sm:p-12">
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
                <div>
                  <Badge variant="gold">TESTFLIGHT PUBLIC BETA</Badge>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    现在就在 Apple Watch 上开玩。
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                    Tiltroom 当前正通过 Apple TestFlight 免费开放公测，后续将正式登陆 App Store。3 步即可装进你的手表：
                  </p>

                  <div className="mt-7 grid gap-4 sm:grid-cols-3">
                    {INSTALL_STEPS.map((s) => (
                      <div
                        key={s.step}
                        className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                      >
                        <span className="font-mono text-xs font-semibold text-[#e7c27a]">
                          {s.step}
                        </span>
                        <h3 className="mt-1.5 text-sm font-bold text-white">
                          {s.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-white/65">
                          {s.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <a
                      href={SITE_LINKS.testflight}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-white/90"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span>打开 TestFlight 邀请链接</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <a
                      href={SITE_LINKS.support}
                      className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
                    >
                      遇到问题？查看技术支持
                    </a>
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <TestFlightQr url={SITE_LINKS.testflight} size={172} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
