# 覆雪之下 · 数据资源总汇（给 Codex）

## 一、本地规则文档（Desktop/覆雪之下/）

### 最新版规则.doc (19,278 字符)
游戏核心机制：
- **每日流程**：白天自由行动(6点)→主持人整理反馈→自由讨论(5点)→夜间阶段(8点)
- **白天行动**：前往地点/调查玩家/生产/使用特性/使用职业技能/隐藏
- **战斗系统**：武器威胁值之和 + 地点防御值 → 对比差值判定结果(死亡/重伤/受伤)
- **夜间结算**：生产建造优先→战斗冲突最后；统治者公布劳工名单
- **交易原则**：自愿自主，需主持人见证；4个统治者仓库+3个阵营仓库
- **搬运限制**：50kg/天不影响行动，300kg/天跳过行动

### 物品清单.doc (2,120 字符)
完整物品数据（25道具+13武器+4弹药+12物资+描述），可直接转为 items.ts

### 玩家特性.doc (5,545 字符)
30+ 玩家特性/天赋描述（含扮演效果），可用于特性系统实现

### 人物物品.doc (1,311 字符)
职业初始装备表（镇长→镇武库钥匙、猎人→猎枪等），可用于职业系统

### 仓库物资.doc (872 字符)
4个公共仓库初始库存（燃料仓库/镇武库/矿场仓库/码头集购仓），直接对应 WarehousePanel

## 二、GitHub mirageshyv/SnowIsland 可复用数据

### src/data/gameData.js (827行, 28KB)
物品图片URL映射 + 名称数据。可直接转为 React 版

### src/data/factionActions.js (159行)
4个阵营各自的行动定义（统治者/反叛者/冒险者/天灾使者）

### src/data/nightActions.js (157行)
夜晚行动类型定义（跟踪/偷窃/破坏/保护等）

### src/data/quickInteraction.js (37行)
快速交互类型（问规则/问DM/笔记等）

### src/data/combatAssist.js (174行)
战斗结算辅助数据（武器威胁值/技能修正等）

### src/data/loreDocuments.js (61行)
世设文档内容（背景故事文本）

### src/data/sabotageTargets.js (17行)
可破坏目标列表

## 三、当前 Codex 项目已有 vs 需要补的

### 数据层（data/）
| 需要 | 来源 | 状态 |
|:-----|:----|:----:|
| locations.ts | 18个地点+NPC | ✅ 已有 |
| warehouseDefaults.ts | 4仓库初始库存（燃料/武库/矿场/码头） | ✅ 已提取 |
| professionDefaults.ts | 32个职业+技能+初始装备 | ✅ 已提取 |
| traitData.ts | 12个玩家特性+效果 | ✅ 已提取 |
| items.ts（描述补充） | 41个物品详细描述（DOC已提取，未集成） | ⚠️ 需Codex决定放哪 |
| 战斗数据 | GitHub combatAssist.js | ❌ 未提取 |
| 阵营行动 | GitHub factionActions.js | ❌ 未提取 |
| 夜晚行动 | GitHub nightActions.js | ❌ 未提取 |
| 世设文档 | GitHub loreDocuments.js | ❌ 未提取 |

### 面板层（components/）
| 组件 | 状态 | 下一步 |
|:-----|:----|:-------|
| StoragePanel | ✅ 已有 | 联调仓库物资数据 |
| TradePanel | ⚠️ 入口 | 补完整交易表单 |
| FactionPanel | ⚠️ 查看 | 补交互按钮 |
| FeedbackPanel | ✅ 已有 | 可深化 |
| LorePanel | ✅ 已有 | 填充规则书+世设内容 |
| 战斗面板 | ❌ 缺 | 可选 |

## 四、建议 Codex 下一步

1. **TradePanel** 补完：选目标玩家→选物品→提交（参考 GitHub TradePanel.vue）
2. **FactionPanel** 加按钮：方舟投料/避难所劳工/里程碑确认/天灾抽卡
3. **LorePanel** 填充：从 GitHub loreDocuments.js 读取世设内容
4. **数据文件** 从 DOC/JSON 提取：
   - 职业表 → 角色创建/选择
   - 特性表 → 特性系统
   - 仓库库存 → WarehousePanel mock 数据
   - 战斗规则 → 战斗面板（可选）
