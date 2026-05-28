# DM 管理面板 — Codex 开发说明

## 背景

旧版 `host_panel.html`（位于 `Desktop/snowfall_host/host_panel.html`，38KB）是一个单文件 HTML 管理面板。
新版后端 `game_backend.py`（已在 VPS 上运行，:8788）有 28 个 API 路由，需要一个配套的 DM 面板。

## 旧面板参考（UI 风格）

旧面板是侧边栏布局，引用 `host_panel.html`：

```
┌────────────────────────────────────┐
│ ❄ 覆雪之下                        │
│ 主持人管理面板                      │
├────────────────────────────────────┤
│ 📊 总览                            │
│ 📥 导入结算                        │
│ 🔍 审核队列          [0]           │
│ ⚡ 批量生成                        │
│ 📜 结局编辑器                      │
│ 📋 历史报告                        │
├────────────────────────────────────┤
│ v0.1.0 · MVP                      │
└────────────────────────────────────┘
```

配色方案（CSS 变量，可直接复用）：
```css
--bg: #0b1120;
--bg-card: #131c31;
--border: #1e3a5f;
--text: #e2e8f0;
--text-dim: #64748b;
--accent: #3b82f6;
```

单文件 HTML + 原生 JS，无框架依赖。DM 可以部署在任何地方。

## 旧面板调用的 API（与新后端对比）

### 旧面板用的（12个端点）：
```text
/api/dashboard               ← 总览数据
/api/rounds                  ← 游戏轮次
/api/round-results           ← 轮次结果
/api/import/round-submissions ← 导入
/api/host/review-queue       ← 审核队列
/api/ai/reports              ← AI 报告
/api/ai/batch-reports        ← 批量生成
/api/endings                 ← 结局管理
/api/players                 ← 玩家列表
```

### 新后端有的（28个路由）：
```text
玩家管理:
  GET    /api/players                      ← 玩家列表
  GET    /api/players/{id}/details         ← 玩家详情
  GET    /api/players/{id}/resources       ← 玩家资源
  GET    /api/players/{id}/items           ← 玩家物品

行动审核:
  GET    /api/actions/player/{id}          ← 玩家行动列表
  POST   /api/actions/submit               ← 提交行动（模拟）
  POST   /api/faction-actions/submit       ← 阵营行动
  POST   /api/night-actions/submit         ← 夜晚行动
  POST   /api/quick-interactions/submit    ← 快速交互

消耗管理:
  GET    /api/player-consumption/context   ← 消耗上下文
  POST   /api/player-consumption/submit    ← 提交消耗

仓库/交易:
  GET    /api/warehouses                   ← 仓库列表
  GET    /api/warehouses/{key}/stock       ← 仓库库存
  GET    /api/trades/player/{id}           ← 玩家交易
  POST   /api/trades                       ← 创建交易（模拟）

阵营系统:
  GET    /api/ark/status                   ← 方舟状态
  GET    /api/shelter                      ← 避难所状态
  GET    /api/milestones/progress          ← 里程碑进度
  GET    /api/catastrophe/progress         ← 天灾进度

游戏控制:
  GET    /api/game-state                   ← 当前游戏状态
  GET    /api/session/current              ← 当前 session
  GET    /api/sessions                     ← 所有 session
  POST   /api/admin/sessions/create        ← 开新局（清数据）

百科:
  GET    /api/lore/catalog                 ← 百科目录
```

## 建议的 DM 面板布局（简化版，比旧面板少一半）

推荐 5 个 Tab，不用旧面板的 6 个：

### Tab 1: 📊 总览
- 当前游戏状态（天数/阶段/天气）
- 玩家数量统计
- 当前 Session ID
- 开新局按钮

API: GET /api/game-state, GET /api/players, GET /api/session/current
      POST /api/admin/sessions/create

### Tab 2: 👥 玩家
- 玩家列表表格（ID/名称/阵营/职业）
- 点击展开：详情、资源、物品
- 搜索/筛选

API: GET /api/players
      GET /api/players/{id}/details
      GET /api/players/{id}/resources
      GET /api/players/{id}/items

### Tab 3: 🎯 行动
- 按玩家查看行动历史
- 按类型筛选（白天/夜晚/阵营/快速）
- 显示行动内容+状态

API: GET /api/actions/player/{id}
      GET /api/faction-actions/player/{id}

### Tab 4: 🏗 阵营
- 方舟/避难所/里程碑/天灾 状态卡片
- 与玩家端 FactionPanel 类似但带更多数据

API: GET /api/ark/status
      GET /api/shelter
      GET /api/milestones/progress
      GET /api/catastrophe/progress

### Tab 5: 📦 仓库
- 4个仓库库存查看
- 交易记录

API: GET /api/warehouses
      GET /api/warehouses/{key}/stock
      GET /api/trades/player/{id}

## 部署位置

两个选项（Codex 决定）：

A. 独立单页 HTML，部署到 `snowfalldm.robotgoing.com`
   - Nginx 加一条 server block
   - 和 React 前端完全独立

B. 在现有 React 项目加一个 `/dm` 路由
   - 和玩家前端共用组件/样式
   - 需要加路由、登录判断

## 旧面板文件位置

```text
Desktop/snowfall_host/
├── host_panel.html      ← 38KB 单文件管理面板（参考 UI）
└── CODEX_SPEC.md        ← 旧版开发文档（可参考但数据不对应）
```

## API 后端位置

```text
VPS: 43.167.254.156
PM2: game-backend → port 8788
测试账号: dm / dm
Swagger 文档: http://localhost:8788/docs
在线 API 基址: https://snowfall.robotgoing.com/api/
```
