# 后端现状 & DM 面板问题 — Codex 排查指引

## 一、服务器信息

```
地址: 43.167.254.156 (robotgoing.com)
用户: ubuntu
密钥: Documents/Codex/2026-05-25/files-mentioned-by-the-user-mp3/SUPERDND.pem
```

## 二、运行中的服务

| PM2 进程 | 端口 | 技术栈 | 职责 |
|:---------|:----:|:------|:-----|
| ai-dm-agent | 8787 | Python BaseHTTPRequestHandler | NPC 对话（DeepSeek）|
| game-backend | 8788 | Python FastAPI + SQLite | 全部游戏 API（28 路由）|

## 三、域名与 Nginx

| 域名 | 用途 | 说明 |
|:-----|:-----|:-----|
| snowfall.robotgoing.com | 玩家前端 | 静态文件 + /api/npc/chat→:8787, /api/*→:8788 |
| snowfalldm.robotgoing.com | DM 控制台 | 静态页面 + /api/*→:8788 |

两个域名共用同一台 VPS，Nginx 用 server_name 区分。

### Nginx 配置路径
```
/etc/nginx/sites-enabled/snowfall-map
/etc/nginx/sites-enabled/snowfalldm  (由 Hermes 创建)
```

## 四、后端文件位置

```
/opt/ai-dm-agent/
├── run.py                    ← PM2 入口 (ai-dm-agent)
├── run_game.py               ← PM2 入口 (game-backend) ← 由 Hermes 创建
├── .env                      ← 配置（DeepSeek key 等）
├── data/
│   └── snowfall_game.db      ← SQLite 数据库（61KB，由 game_backend 自动创建）
├── dm_panel/
│   └── index.html            ← DM 面板（33KB，由 Codex 创建，Hermes 部署）
├── dist/                     ← 玩家前端构建产物
└── snowfall_host/
    ├── api_server.py         ← AI DM Agent HTTP 路由
    ├── game_backend.py       ← 游戏后端（28 路由，FastAPI + SQLite）
    ├── model_client.py       ← DeepSeek 调用
    ├── snowisland_client.py  ← SnowIsland 代理（不再使用）
    ├── ai_dm_agent.py        ← DM 后台循环
    └── config.py             ← 配置读取
```

## 五、game_backend.py 已实现的 28 个路由

```
POST   /api/auth/login                    ← 登录（自动注册不存在的用户）
GET    /api/game-state                    ← 当前游戏状态
GET    /api/players                       ← 所有玩家
GET    /api/players/{player_id}/details   ← 玩家详情
GET    /api/players/{player_id}/resources ← 玩家资源
GET    /api/players/{player_id}/items     ← 玩家物品
POST   /api/actions/submit                ← 白天行动
POST   /api/faction-actions/submit        ← 阵营行动
POST   /api/night-actions/submit          ← 夜晚行动
POST   /api/quick-interactions/submit     ← 快速交互
GET    /api/actions/player/{player_id}    ← 玩家行动列表
GET    /api/faction-actions/player/{player_id}
GET    /api/night-actions/context/{player_id}
GET    /api/quick-interactions/context/{player_id}
GET    /api/player-consumption/context    ← 消耗上下文
POST   /api/player-consumption/submit     ← 提交消耗
GET    /api/warehouses                    ← 仓库列表
GET    /api/warehouses/{warehouse_key}/stock ← 仓库库存
GET    /api/trades/player/{player_id}     ← 玩家交易
POST   /api/trades                        ← 创建交易
GET    /api/ark/status                    ← 方舟状态
GET    /api/shelter                       ← 避难所状态
GET    /api/milestones/progress           ← 反叛者里程碑
GET    /api/catastrophe/progress          ← 天灾进度
GET    /api/lore/catalog                  ← 百科目录
GET    /api/sessions                      ← 所有 session
POST   /api/admin/sessions/create         ← 创建新局（清空本局数据）
GET    /api/session/current               ← 当前 session
```

默认测试账号：
```
玩家: demo / demo
DM:   dm / dm
```

## 六、DM 面板已知问题

### 问题 1: DM 面板点击"进入后台"没反应
- 症状：页面加载正常，输入账号密码，点按钮无反应
- 已排查：
  - API 本身工作正常：`curl https://snowfalldm.robotgoing.com/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"dm","password":"dm"}'` 返回 200 ✅
  - 前端 JS 无语法错误 ✅
  - `showLogin()` 和 `showApp()` 函数存在 ✅
  - 事件监听 `$("login-submit").addEventListener("click", ...)` 已绑定 ✅
  - 可能是 DOM 加载时机问题（没有用 DOMContentLoaded 包装），或请求被浏览器 CORS/Preflight 拦截
- 需要检查：浏览器开发者工具 Console 是否有 JS 错误、Network 选项卡看 API 请求是否发出

### 问题 2: 夜晚行动/快速交互 API 路径不匹配
- DM 面板调用 `/night-actions/player/${id}` 但后端只有 `/night-actions/context/${id}`
- DM 面板调用 `/quick-interactions/player/${id}` 但后端只有 `/quick-interactions/context/${id}`
- 已用 sed 修复了 night-actions 路径，quick-interactions 在 DM 面板中未发现调用
- 需要验证：修复是否生效，.catch(() => []) 兜底是否正常工作

### 问题 3: 玩家前端 vs DM 面板的数据格式可能不一致
- 玩家前端（React）通过 api.ts 调后端，有字段映射逻辑
- DM 面板（原生 JS）直接调后端，期望的返回格式可能与后端实际返回不一致
- 例如：玩家详情接口返回的字段名可能不符合 DM 面板期望

## 七、需要 Codex 做的

1. **排查 DM 面板登录问题**：打开 https://snowfalldm.robotgoing.com/ → F12 Console → 点"进入后台"→ 看有没有报错
2. **如需要，修改 DM 面板的 api() 函数或 login 事件处理**
3. **验证其他 4 个 Tab（总览/玩家/行动/阵营/仓库）的数据是否正常显示**
4. **两个后端代码路径**：
   - DM 面板: `/opt/ai-dm-agent/dm_panel/index.html` (33KB)
   - 游戏后端: `/opt/ai-dm-agent/snowfall_host/game_backend.py` (600行, FastAPI + SQLite)
