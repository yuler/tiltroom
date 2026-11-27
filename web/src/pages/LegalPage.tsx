import { ArrowLeft, ArrowUpRight, Github, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { APP_META, SITE_LINKS } from "@/lib/constants";

export type LegalPageKind = "privacy" | "terms" | "support";

const SUPPORT_FAQS = [
  {
    q: "如何将 Tiltroom 安装到 Apple Watch？",
    a: "请先在已配对的 iPhone 上安装 Apple 官方 TestFlight，点击本网站上的 TestFlight 邀请链接接受测试。作为 Watch-only 独立应用，接受后系统会自动将其安装到你的 Apple Watch（也可在 iPhone 的 TestFlight → Tiltroom 中开启「在 Apple Watch 上显示 App」）。",
  },
  {
    q: "为什么手腕放平时点表盘没有反应？",
    a: "这是「重力快门」的防误触保护。请先稍微侧腕（左右翻腕或轻仰/轻垂），直到表盘边缘亮起金色方向指示，再轻点表盘触发滑落。你也可以直接在表盘上向四向滑动（Swipe）作为替代操作。",
  },
  {
    q: "卸载或更换手表后，关卡进度会同步吗？",
    a: "当前 v1 版本为纯手表本地存档，不包含云同步与账号系统。卸载应用会清除本地通关记录与最佳步数。",
  },
  {
    q: "遇到 Bug 或有关卡建议如何反馈？",
    a: "欢迎直接前往 GitHub Issues 提交问题报告，或在 TestFlight 应用内使用「发送反馈」功能附带截图与 watchOS 版本号。",
  },
];

export function LegalPage({ kind }: { kind: LegalPageKind }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-foreground">
      <SiteHeader isSubpage />

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>返回 Tiltroom 首页</span>
        </a>

        {kind === "privacy" && (
          <article className="mt-6 space-y-6">
            <div>
              <Badge variant="default">
                <ShieldCheck className="h-3.5 w-3.5" />
                零数据收集
              </Badge>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                隐私政策
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                更新日期：2026 年 11 月 · 适用应用：{APP_META.name}（Bundle ID：{APP_META.bundleId}）
              </p>
            </div>

            <Card>
              <CardContent className="space-y-6 p-7 text-sm leading-7 text-muted-foreground sm:p-9">
                <section>
                  <h2 className="text-base font-bold text-foreground">
                    1. 我们不收集任何个人数据
                  </h2>
                  <p className="mt-2">
                    {APP_META.name} 是一款纯本地运行的 Apple Watch 独立应用（Watch-only）。应用不包含用户注册、登录系统，不接入任何第三方广告或统计分析 SDK，也不会收集、存储或上传您的姓名、邮箱、设备标识符、位置信息或使用行为数据。
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-foreground">
                    2. 传感器与本地存档说明
                  </h2>
                  <p className="mt-2">
                    游戏运行期间仅在设备本地实时读取 Apple Watch 的运动重力方向，用于计算「重力快门」的瞄准角度；传感器数据不会被记录、持久化或发送至任何服务器。您的关卡进度与最佳步数仅保存在手表本地存储中，卸载应用后即随系统自动删除。
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-foreground">
                    3. TestFlight 与 Apple 系统诊断
                  </h2>
                  <p className="mt-2">
                    在 TestFlight 公测期间，若您主动选择通过 Apple TestFlight 提交崩溃日志或文字反馈，相关数据的处理遵循 Apple 的隐私政策与 TestFlight 服务条款。
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-foreground">
                    4. 联系我们
                  </h2>
                  <p className="mt-2">
                    如您对本隐私政策有任何疑问，请通过{" "}
                    <a
                      href={SITE_LINKS.issues}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      GitHub Issues
                    </a>{" "}
                    与开发者联系。
                  </p>
                </section>
              </CardContent>
            </Card>
          </article>
        )}

        {kind === "terms" && (
          <article className="mt-6 space-y-6">
            <div>
              <Badge variant="neutral">使用条款</Badge>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                用户协议
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                更新日期：2026 年 11 月 · 适用应用：{APP_META.name}（{APP_META.bundleId}）
              </p>
            </div>

            <Card>
              <CardContent className="space-y-6 p-7 text-sm leading-7 text-muted-foreground sm:p-9">
                <section>
                  <h2 className="text-base font-bold text-foreground">
                    1. 授权范围
                  </h2>
                  <p className="mt-2">
                    {APP_META.name} 通过 Apple TestFlight 及未来的 App Store 向您提供面向 Apple Watch 的个人非商业使用许可。您同意遵守 Apple 媒体服务条款与相关平台规范。
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-foreground">
                    2. 公测版本说明
                  </h2>
                  <p className="mt-2">
                    当前通过 TestFlight 分发的版本属于公测版本，关卡设计、交互细节与视觉表现可能随迭代调整。本地进度在版本升级过程中通常保留，但不对测试版本的数据永久性作绝对保证。
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-foreground">
                    3. 使用安全提示
                  </h2>
                  <p className="mt-2">
                    请勿在驾驶、骑行或需要集中注意力的行进场景下游玩本游戏。
                  </p>
                </section>

                <section>
                  <h2 className="text-base font-bold text-foreground">
                    4. 知识产权与协议变更
                  </h2>
                  <p className="mt-2">
                    {APP_META.name} 的关卡设计、界面视觉、文案与代码受相关知识产权法律保护。我们可能在必要时更新本协议并在本页公布最新生效日期。
                  </p>
                </section>
              </CardContent>
            </Card>
          </article>
        )}

        {kind === "support" && (
          <article className="mt-6 space-y-6">
            <div>
              <Badge variant="default">技术支持</Badge>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                支持与常见问题
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                关于 {APP_META.name} 的安装、操控体验与问题反馈渠道。
              </p>
            </div>

            <Card>
              <CardContent className="p-7 sm:p-9">
                <h2 className="text-base font-bold text-foreground">
                  常见问题（FAQ）
                </h2>
                <Accordion className="mt-3">
                  {SUPPORT_FAQS.map((item, index) => (
                    <AccordionItem key={item.q} value={`faq-${index}`}>
                      <AccordionTrigger>{item.q}</AccordionTrigger>
                      <AccordionContent>{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col justify-between gap-5 p-7 sm:flex-row sm:items-center sm:p-9">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    提交问题或功能建议
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    请前往 GitHub Issues 反馈，建议附上 Apple Watch 型号与 watchOS 版本。
                  </p>
                </div>
                <a
                  href={SITE_LINKS.issues}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#333336]"
                >
                  <Github className="h-4 w-4" />
                  <span>前往 GitHub Issues</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          </article>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
