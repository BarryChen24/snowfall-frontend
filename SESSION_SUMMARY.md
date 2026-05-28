# 会话总结 & 下一步指引

## 一、Hermes 做了什么

### 1. 部署 Codex 构建 → VPS
- 从 `Codex/2026-05-25/files-mentioned-by-the-user-mp3/snowfall-map-trinity/dist/` 部署到 VPS `/opt/ai-dm-agent/dist/`
- 线上: https://snowfall.robotgoing.com/ → HTTP 200

### 2. 覆盖桌面源码
- Codex 沙箱源码 → `Desktop/snowfall-map/`（旧版备份到 `snowfall-map.BAK2/`）

### 3. 修复 VPS 后端崩溃
**AI DM Agent 曾 3 次崩溃，原因都不同：**

| 次数 | 原因 | 修了什么 | 涉及文件 |
|:----|:----|:--------|:--------|
| 1 | 中文 fallback 的 `f""...""` 语法错误 | 改为 `f'...'`（单引号括中文） | `/opt/ai-dm-agent/snowfall_host/api_server.py` 第 319/321/326/331 行 |
| 2 | 同上，sed 替换失败 | 本地读文件→Python fix→SCP回写 | 同上 |
| 3 | DeepSeek API key 过期 (`...298d`) | 更新为 `sk-2190c1c067544eaba1f249e74fbb6db2` | `/opt/ai-dm-agent/.env` 第1行 |

### 4. 项目对比分析
- 生成了 `Desktop/snowfall-map/COMPARISON_REPORT_COMPLETE.md`（原始 301 文件 vs Codex 18 文件）
- 生成了 `Desktop/snowfall-map/FUNCTIONAL_GAP.md`（按玩家需求分组，建议合并方向）

---

## 二、当前线上状态

| 组件 | 状态 |
|:-----|:----|
| 前端页面 | ✅ 加载正常 |
| 登录 | ✅ mock |
| 雪岛地图 | ✅ 18个热点 |
| NPC 对话 | ✅ DeepSeek 中文+好感度+上下文 |
| 状态栏 | ✅ |
| 行动提交 | ✅ mock |
| 每日消耗 | ✅ |
| 行动反馈 | ✅ |
| 后端 AI DM Agent | ✅ online |
| DeepSeek API | ✅ 新 key 有效 |

---

## 三、Codex 下一步应该做的

### P0 - 玩家核心（不补没法玩）

#### 3.1 背包+仓库合并 → StoragePanel
- Codex 已经建了 `StoragePanel.tsx`（3.9KB），确认逻辑完整
- 需要联调后端 API

#### 3.2 交易简化版 → TradePanel
- Codex 已经建了 `TradePanel.tsx`（1.5KB）
- 补完：发起交易→选择目标玩家→选择物品→提交

#### 3.3 阵营交互补完 → FactionPanel
- Codex 已建了架子（2.1KB）
- 补：避难所劳工名单提交、方舟投料、里程碑完成、天灾抽卡

### P1 - 体验增强

#### 3.4 反馈深化 → FeedbackPanel
- 按天数筛选、按行动类型分类

#### 3.5 百科 → LorePanel
- 规则书 + 世设文档，直接从原始项目取数据

### P2 - 长期

#### 3.6 DM 后台简化版
- 3个Tab：行动审核 / 玩家管理 / 游戏控制

#### 3.7 后端
- 选项 A：部署原始 Spring Boot（Java 11 + MySQL）
- 选项 B：在 AI DM Agent 里扩 mock
- 选项 C：重写轻量后端（Node.js/Python）

---

## 四、VPS 关键文件路径

```
后端服务:
├─ /opt/ai-dm-agent/run.py                    # PM2 入口
├─ /opt/ai-dm-agent/.env                      # 配置（API key等）
├─ /opt/ai-dm-agent/snowfall_host/
│   ├─ api_server.py          ← Hermes 修过中文fallback语法
│   ├─ model_client.py        # DeepSeek 调用客户端
│   ├─ snowisland_client.py   # SnowIsland 代理
│   ├─ ai_dm_agent.py         # DM Agent 后台循环
│   └─ config.py              # 配置读取
└─ /opt/ai-dm-agent/dist/                     # 前端构建产物

Nginx:
├─ /etc/nginx/sites-enabled/snowfall-map      # snowfall.robotgoing.com 配置

前端源码 (桌面):
├─ Desktop/snowfall-map/                      # Codex 源码
├─ Desktop/snowfall-map/CODEX_GUIDE.md        # 开发指引
├─ Desktop/snowfall-map/COMPARISON_REPORT_COMPLETE.md  # 完整对比
└─ Desktop/snowfall-map/FUNCTIONAL_GAP.md     # 功能缺口分析
```

---

## 五、Hermes 以后只做什么

- 部署 Codex 构建到 VPS
- 诊断线上问题
- 更新配置（API key 等）
- 不写/改前端代码
