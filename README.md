# Tiltroom

一款面向 Apple Watch 的独立（watch-only）倾斜解谜游戏，核心交互机制为**「重力快门」**——先侧腕瞄准重力方向，确认后再触发快门，让棋盘上的物体沿该方向滑落。

## 定位与 v1 边界

- **平台形态**：Apple Watch 原生独立 watchOS App（Standalone），不设 iOS 伴侣 App。
- **核心玩法**：4 向离散格滑行解谜，沿用原型已验证的 6 种核心元素（弹珠、墙、钥匙、门、洞、箱子）与约 30 关内容，纯手表本地存档（通关状态与最佳步数）。
- **操控方向**：以「手腕倾斜瞄准 + 快门触发」为主操作，保留表盘直接滑动（Swipe）作为兜底操作。
- **v1 目标**：交付可在实体 Apple Watch 上完整游玩的 TestFlight 版本；App Store 商业化、新机关、云同步、排行榜与表盘小组件等留待后续版本。
- **领域术语**：见 [GLOSSARY.md](./GLOSSARY.md)。

## 交互原型

直接用浏览器打开 [prototypes/gravity-shutter.html](./prototypes/gravity-shutter.html) 即可试玩当前 30 关网页原型（使用页面下方罗盘或方向键模拟倾腕，点击表盘或松手触发滑落）。

> 注：网页原型包含早期任意角度滑行实验逻辑；watch-only v1 已确定采用 **4 向离散格滑行**。

## 构建、发布与 TestFlight

本仓库采用 **GitHub Actions macOS 自动签名归档 + TestFlight 上传 + 自动打 Tag 发版**（本地无需 Mac/Xcode）：

| Item          | Value                                      |
| ------------- | ------------------------------------------ |
| Bundle ID     | `cc.yuler.tiltroom`                        |
| ASC App ID    | `6839532584`                               |
| Internal Test | `Internal`（免 Beta 审核，构建处理完即装） |
| External Link | https://testflight.apple.com/join/tFEsQYTf |

- **CI 校验**（[.github/workflows/ci.yml](./.github/workflows/ci.yml)）：PR / `main` 推送自动校验发版脚本与 watchOS 工程构建。
- **自动发版与 TestFlight**（[.github/workflows/release.yml](./.github/workflows/release.yml) + [.github/workflows/watch-release.yml](./.github/workflows/watch-release.yml)）：`watch/` 或发版脚本改动合入 `main` 且 CI 通过后，自动递增 SemVer、在 macOS runner 手动分发签名并导出 `.ipa`、通过 `asc builds upload` 直传 TestFlight，成功后再原子打 `v*` Tag 并发布 GitHub Release。
- **环境检查**：运行 `./scripts/setup-testflight.sh check` 检查本地 `asc`、`gh` 与 `.env`（参考 [.env.example](./.env.example)）。
