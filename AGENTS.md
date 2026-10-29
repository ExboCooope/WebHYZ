# AGENTS.md

> 给 AI 会话的入口文件。**先读 [项目导航.md](项目导航.md)**，它按「我要做什么 → 打开哪个文件:行号」组织；需要背景再读 [项目结构总结.md](项目结构总结.md)。

## 这是什么

**WebHYZ** = 2017 年的自研浏览器弹幕 STG 引擎 **JavaSTaGe** + 东方同人游戏《网页东方 · 香椿の花嫁》。
纯 JS（ES5）+ Canvas/WebGL + WebSocket；**无构建工具、无模块系统**，靠 [javastage.js](javastage.js) 的脚本清单 + 全局变量串联。

## 常用命令

```powershell
# 运行（本目录）
python -m http.server 8123        # → http://127.0.0.1:8123/index.html（↑↓ 选包，Z 确认）
# headless 冒烟跑测：Node 打桩 DOM/WebGL，真跑引擎帧循环，结果写 .run-test/report.json
node .run-test/harness.mjs
```

## 三条硬约定

1. **新增脚本必须登记**进 [javastage.js](javastage.js) 的 `core_scripts / webgl_scripts / default_scripts / *_core` 数组（或对应 `*_package.js`），否则不会被加载。
2. **入口只有 [index.html](index.html)**（+ 等价的 `index_test.html`）。`index_hyz.html` / `index_shw.html` / `index_old.html` 是历史快照，缺 `STGOBJECT.js`，启动即 `ReferenceError`。
3. **别 `git add .`**：`.dsh-config-backup/` 含明文 QQ 机器人凭据；`system.tmp`、`tiny.dat` 是无关碎片。

## 遥控 DSH 本体时的硬约束（人机交互闸门）

> 适用范围：**只管操作 DSH 本体**（调 `127.0.0.1:19387` 的宿主 RPC、代管别的会话）。
> **不适用**于上面那三条（游戏本体的约定）。用户于 2026-10-15 明确定下。

收到 `approval/request`（提权）或 `user-questions/request`（选项）时：

1. **只读不判** —— 读一遍，但**绝不代为选择**，不管选项看起来多显然。
2. **读懂了再报** —— 报告要带自己的判读：这条请求要做什么、动到什么、风险在哪。
3. **选项原样给** —— 把宿主给的选项（`allowed-once` / `rejected`、各问题的 option label）**原样**列出，
   不替用户排序、不推荐、不预设默认。
4. **等用户选完才应答** —— 用户答复到达前保持挂起。**挂起没有超时**，等多久都行，不要因为"等太久"就自己决定。
5. **只投用户给的值** —— 应答时只投用户明确给的结果；缺项就**大声失败**，宁可报错也不要猜。

工具：[dsh-qqbot-remote-lab/probes/human-gate.mjs](dsh-qqbot-remote-lab/probes/human-gate.mjs)
—— `watch` 只报不应答，`answer` 只投用户给的值。
依据与实测：[notes/R11.md](dsh-qqbot-remote-lab/notes/R11.md)（审批）、[notes/R12.md](dsh-qqbot-remote-lab/notes/R12.md)（问答）。

## 高频文件

| 用途 | 文件 |
|---|---|
| 脚本清单 / 加载顺序 | [javastage.js](javastage.js) |
| 主循环、对象系统、入口 `stgStart` | [STGCORE.js](STGCORE.js)（`_stgMainLoop:625`、`stgStart:1891`、`stgAddObject:1669`） |
| 常量 / 键位 / 全局状态 | [STGGLOBAL.js](STGGLOBAL.js)（`KEY_MAP:135`） |
| 关卡范例、主 Boss | [GAME/shw/shw_level.js](GAME/shw/shw_level.js)、[GAME/boss_slz.js](GAME/boss_slz.js) |
| 自机范例 | [players/player_reimu.js](players/player_reimu.js)（新版 `th.*`） |
| 双画面机制 | [GAME/hyz/hyz_system.js](GAME/hyz/hyz_system.js)（`hyzSetBattleStyle:607`） |
| 渲染底层 | [WebGL/shaders.js](WebGL/shaders.js)、[GAME/hyz/hyz_shaders.js](GAME/hyz/hyz_shaders.js) |

运行现状（2026-10-15 实测）：引擎可 headless 跑通 BIOS → SHW 包 → `shw_level` 关卡，连续 3600+ 帧零异常，Boss 正常进入符卡。详见 [项目结构总结.md](项目结构总结.md) 第 6 节。
