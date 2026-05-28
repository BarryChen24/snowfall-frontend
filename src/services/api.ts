export interface AuthSession {
  token: string
  player?: {
    id?: string | number
    name?: string
    faction?: string
    role?: string
  }
  role?: string
  username?: string
}

export interface GameState {
  day?: number
  phase?: string
  weather?: string
  summary?: string
}

export interface PlayerResources {
  food?: number
  fuel?: number
  materials?: number
  medicine?: number
  [key: string]: number | string | undefined
}

export interface InventoryItem {
  id: string | number
  type?: string
  itemType?: string
  name: string
  unit?: string
  quantity: number
  description?: string
}

export interface WarehouseSummary {
  warehouseKey: string
  name?: string
  warehouseName?: string
  accessible?: boolean
}

export interface WarehouseStockItem extends InventoryItem {
  itemId?: string | number
}

export interface TradeItem {
  id: string | number
  fromPlayerName?: string
  toPlayerName?: string
  status?: string
  remark?: string
  createdAt?: string
  items?: InventoryItem[]
}

export interface ProgressResource {
  name: string
  current: number
  max: number
  unit?: string
}

export interface ProgressSummary {
  title: string
  progress: number
  description?: string
  resources?: ProgressResource[]
  status?: string
}

export type QuickInteractionType = "quick_action" | "note" | "rules_question" | "ask_dm"

export interface ConsumptionContext {
  success: boolean
  foodMet: boolean
  fuelMet: boolean
  requiredFoodUnits: number
  requiredFuelKg: number
  consumedFoodUnits: number
  consumedFuelKg: number
  remainingFoodUnits: number
  remainingFuelKg: number
  availableFoodUnits: number
  availableFuelKg: number
  message?: string
}

export interface ActionFeedbackItem {
  id: string | number
  day?: number
  phase?: string
  title?: string
  actionType?: string
  result?: string
  reward?: string
  status?: string
}

const SNOW_ISLAND_API = import.meta.env.VITE_SNOW_ISLAND_API || "/api"
const AI_DM_API = import.meta.env.VITE_AI_DM_API || "/api"

function token(): string {
  return localStorage.getItem("snowfall_token") || ""
}

function userRole(): string {
  return localStorage.getItem("userRole") || getStoredSession().role || "player"
}

function headers(): HeadersInit {
  const auth = token()
  return {
    "Content-Type": "application/json",
    ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
  }
}

async function jsonFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const resp = await fetch(url, {
    ...init,
    headers: { ...headers(), ...(init.headers || {}) },
  })
  const text = await resp.text()
  const data = text ? JSON.parse(text) : {}
  if (!resp.ok) {
    throw new Error(data?.message || data?.error || `请求失败：${resp.status}`)
  }
  return data as T
}

function getStoredSession(): AuthSession {
  try {
    return JSON.parse(localStorage.getItem("snowfall_session") || "{}")
  } catch {
    return { token: "" }
  }
}

function normalizeInventory(items: any[]): InventoryItem[] {
  return items.map((item, index) => ({
    id: item.id ?? item.itemId ?? `${item.itemType || item.type || "item"}-${index}`,
    type: item.type ?? item.itemType,
    itemType: item.itemType ?? item.type,
    name: item.name ?? item.itemName ?? "未知物品",
    unit: item.unit ?? item.unitName ?? "",
    quantity: Number(item.quantity ?? item.count ?? 0),
    description: item.description,
  }))
}

export async function login(username: string, password: string): Promise<AuthSession> {
  const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
  if (data.success === false) throw new Error(data.message || "登录失败")

  const session: AuthSession = {
    token: data.token || data.access_token || data.jwt || `snowisland-${data.userId || username}`,
    username: data.username || username,
    role: data.role || "player",
    player: {
      id: data.playerId || data.userId || data.player?.id,
      name: data.playerName || data.username || username,
      faction: data.faction || data.player?.faction,
      role: data.job || data.player?.role,
    },
  }

  localStorage.setItem("snowfall_token", session.token)
  localStorage.setItem("snowfall_session", JSON.stringify(session))
  localStorage.setItem("snowfall_player", JSON.stringify(session.player || {}))
  localStorage.setItem("username", session.username || username)
  localStorage.setItem("userRole", session.role || "player")
  if (data.userId) localStorage.setItem("userId", String(data.userId))
  if (session.player?.id) localStorage.setItem("playerId", String(session.player.id))
  return session
}

export function logout(): void {
  localStorage.removeItem("snowfall_token")
  localStorage.removeItem("snowfall_player")
  localStorage.removeItem("snowfall_session")
  localStorage.removeItem("username")
  localStorage.removeItem("userRole")
  localStorage.removeItem("userId")
  localStorage.removeItem("playerId")
}

export function getStoredPlayer(): AuthSession["player"] {
  try {
    return JSON.parse(localStorage.getItem("snowfall_player") || "{}")
  } catch {
    return {}
  }
}

export function getStoredPlayerId(): string {
  return String(localStorage.getItem("playerId") || getStoredPlayer()?.id || "1")
}

export function isLoggedIn(): boolean {
  return Boolean(token())
}

export async function getGameState(): Promise<GameState> {
  try {
    const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/game-state`)
    return {
      day: data.day ?? data.currentDay ?? 1,
      phase: data.phase ?? (data.currentPhase === "NIGHT" ? "夜晚" : "白天"),
      weather: data.weather,
      summary: data.summary,
    }
  } catch {
    return { day: 1, phase: "白天", weather: "气温下降" }
  }
}

export async function getPlayers(): Promise<any[]> {
  try {
    const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/players`)
    return Array.isArray(data) ? data : data.players || []
  } catch {
    return [
      { id: 1, name: "亚当", faction: "冒险者" },
      { id: 2, name: "薇拉", faction: "统治者" },
    ]
  }
}

export async function getPlayerDetails(playerId: string): Promise<any> {
  try {
    const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/players/${playerId}/details`)
    return {
      id: data.id ?? data.playerId ?? playerId,
      name: data.name ?? data.playerName ?? data.username ?? "旅人",
      faction: data.faction ?? data.playerFaction ?? "冒险者",
      role: data.role ?? data.job ?? data.jobName ?? "幸存者",
      statuses: data.statuses,
    }
  } catch {
    return { id: playerId, name: "旅人", faction: "冒险者", role: "幸存者" }
  }
}

export async function getPlayerResources(playerId: string): Promise<PlayerResources> {
  try {
    const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/players/${playerId}/resources`)
    return {
      food: data.food ?? data.foodKg ?? data.foodUnits ?? 0,
      fuel: data.fuel ?? data.fuelKg ?? 0,
      materials: data.materials ?? data.materialKg ?? data.wood ?? 0,
      medicine: data.medicine ?? 0,
    }
  } catch {
    return { food: 12, fuel: 8, materials: 5, medicine: 1 }
  }
}

export async function getPlayerItems(playerId: string): Promise<InventoryItem[]> {
  try {
    const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/players/${playerId}/items`)
    return normalizeInventory(Array.isArray(data) ? data : data.items || [])
  } catch {
    return normalizeInventory([
      { id: 5, itemType: "material", name: "食物", unit: "kg", quantity: 12 },
      { id: 8, itemType: "material", name: "燃料", unit: "kg", quantity: 8 },
      { id: 2, itemType: "item", name: "手电筒", unit: "个", quantity: 1 },
      { id: 10, itemType: "item", name: "朗姆酒", unit: "瓶", quantity: 2 },
    ])
  }
}

export function submitDayAction(payload: { actionType: string; target?: string; note?: string }): Promise<any> {
  return jsonFetch(`${SNOW_ISLAND_API}/actions/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function submitQuickInteraction(payload: { type: QuickInteractionType; content: string }): Promise<any> {
  return jsonFetch(`${SNOW_ISLAND_API}/quick-interactions/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function submitFactionAction(payload: { actionType: string; target?: string; note?: string }): Promise<any> {
  return jsonFetch(`${SNOW_ISLAND_API}/faction-actions/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function submitNightAction(payload: { actionType: string; target?: string; note?: string }): Promise<any> {
  return jsonFetch(`${SNOW_ISLAND_API}/night-actions/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getConsumptionContext(playerId: string, gameDay: number): Promise<ConsumptionContext> {
  try {
    const q = new URLSearchParams({ playerId, gameDay: String(gameDay) })
    return await jsonFetch<ConsumptionContext>(`${SNOW_ISLAND_API}/player-consumption/context?${q}`)
  } catch {
    return {
      success: true,
      foodMet: false,
      fuelMet: false,
      requiredFoodUnits: 2,
      requiredFuelKg: 15,
      consumedFoodUnits: 0,
      consumedFuelKg: 0,
      remainingFoodUnits: 2,
      remainingFuelKg: 15,
      availableFoodUnits: 12,
      availableFuelKg: 8,
      message: "本地预览数据",
    }
  }
}

export function submitConsumption(payload: {
  playerId: string
  gameDay: number
  foodUnits: number
  woodKg: number
  fuelKg: number
  confirmOverFuel?: boolean
}): Promise<ConsumptionContext> {
  return jsonFetch(`${SNOW_ISLAND_API}/player-consumption/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getActionFeedback(playerId: string): Promise<ActionFeedbackItem[]> {
  try {
    const [day, faction, night, quick] = await Promise.all([
      jsonFetch<any>(`${SNOW_ISLAND_API}/actions/player/${playerId}`).catch(() => []),
      jsonFetch<any>(`${SNOW_ISLAND_API}/faction-actions/player/${playerId}`).catch(() => []),
      jsonFetch<any>(`${SNOW_ISLAND_API}/night-actions/context/${playerId}`).catch(() => []),
      jsonFetch<any>(`${SNOW_ISLAND_API}/quick-interactions/context/${playerId}`).catch(() => []),
    ])
    const rows = [day, faction, night, quick].flatMap((value) => Array.isArray(value) ? value : value.items || value.actions || [])
    return rows.map((item: any, index: number) => ({
      id: item.id ?? index,
      day: item.gameDay ?? item.day,
      phase: item.phase,
      title: item.title ?? item.actionType ?? item.type,
      actionType: item.actionType ?? item.type,
      result: item.feedback ?? item.result ?? item.reply,
      reward: item.reward,
      status: item.status,
    }))
  } catch {
    return [
      {
        id: "mock-1",
        day: 1,
        phase: "白天",
        title: "调查码头",
        result: "你打听到码头仓库夜里有人搬运带军用标记的箱子。",
        status: "本地预览数据",
      },
    ]
  }
}

export async function getWarehouses(playerId = getStoredPlayerId()): Promise<WarehouseSummary[]> {
  try {
    const q = new URLSearchParams({ playerId, userRole: userRole() })
    const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/warehouses?${q}`)
    return Array.isArray(data) ? data : data.warehouses || []
  } catch {
    return [
      { warehouseKey: "town", name: "镇公共仓库", accessible: true },
      { warehouseKey: "dock", name: "码头集购站", accessible: true },
    ]
  }
}

export async function getWarehouseStock(warehouseKey: string, playerId = getStoredPlayerId()): Promise<WarehouseStockItem[]> {
  try {
    const q = new URLSearchParams({ playerId, userRole: userRole() })
    const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/warehouses/${warehouseKey}/stock?${q}`)
    return normalizeInventory(data.items || data.stockItems || data)
  } catch {
    return normalizeInventory([
      { itemId: 5, itemType: "material", name: "食物", unit: "kg", quantity: 80 },
      { itemId: 8, itemType: "material", name: "燃料", unit: "kg", quantity: 36 },
      { itemId: 3, itemType: "material", name: "绳索", unit: "米", quantity: 20 },
    ])
  }
}

export async function getTrades(playerId = getStoredPlayerId()): Promise<TradeItem[]> {
  try {
    const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/trades/player/${playerId}`)
    return Array.isArray(data) ? data : data.trades || []
  } catch {
    return [
      { id: 1, fromPlayerName: "亚当", toPlayerName: "薇拉", status: "pending", remark: "用燃料换药品" },
      { id: 2, fromPlayerName: "码头工会", toPlayerName: "你", status: "completed", remark: "木材结算" },
    ]
  }
}

export function createTrade(payload: any): Promise<any> {
  return jsonFetch(`${SNOW_ISLAND_API}/trades`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getFactionProgress(faction?: string): Promise<ProgressSummary[]> {
  const f = faction || getStoredPlayer()?.faction || ""
  const rows: ProgressSummary[] = []
  try {
    if (f === "冒险者" || !f) {
      const ark = await jsonFetch<any>(`${SNOW_ISLAND_API}/ark/status`).catch(() => null)
      rows.push({
        title: "方舟建设",
        progress: Number(ark?.completionPercentage ?? ark?.progress ?? 38),
        description: "冒险者阵营的撤离工程。",
        resources: [
          { name: "木材", current: ark?.currentWood ?? 95, max: ark?.targetWood ?? 250, unit: "吨" },
          { name: "金属", current: ark?.currentMetal ?? 28, max: ark?.targetMetal ?? 100, unit: "吨" },
          { name: "密封材料", current: ark?.currentSealant ?? 18, max: ark?.targetSealant ?? 100, unit: "kg" },
        ],
      })
    }
    if (f === "统治者" || !f) {
      const shelter = await jsonFetch<any>(`${SNOW_ISLAND_API}/shelter`).catch(() => null)
      rows.push({
        title: "统治者避难所",
        progress: Number(shelter?.completionPercentage ?? shelter?.buildProgress ?? 42),
        description: "镇长厅控制的避难所与公共储备。",
        resources: [
          { name: "公共食物", current: shelter?.food ?? 120, max: 300, unit: "kg" },
          { name: "公共燃料", current: shelter?.fuel ?? 45, max: 160, unit: "kg" },
        ],
      })
    }
    if (f === "反抗者" || !f) {
      const rebel = await jsonFetch<any>(`${SNOW_ISLAND_API}/milestones/progress?playerId=${getStoredPlayerId()}&userRole=${userRole()}`).catch(() => null)
      rows.push({
        title: "反抗者里程碑",
        progress: Number(rebel?.completionPercentage ?? rebel?.progress ?? 25),
        description: "秘密网络、据点与民心推进情况。",
      })
    }
    if (f === "天灾使者" || !f) {
      const catastrophe = await jsonFetch<any>(`${SNOW_ISLAND_API}/catastrophe/progress`).catch(() => null)
      rows.push({
        title: "天灾降临",
        progress: Number(catastrophe?.progress ?? catastrophe?.value ?? 30),
        description: "天灾阶段、抽卡与污染推进情况。",
        status: catastrophe?.status,
      })
    }
    return rows
  } catch {
    return []
  }
}

export async function getRuleBook(): Promise<string[]> {
  try {
    const data = await jsonFetch<any>(`${SNOW_ISLAND_API}/lore/catalog?userRole=${userRole()}&playerId=${getStoredPlayerId()}`)
    const rows = Array.isArray(data) ? data : data.items || data.catalog || []
    return rows.map((item: any) => item.title || item.name || item.slug).filter(Boolean)
  } catch {
    return ["白天提交行动，夜晚提交隐秘行动。", "食物和燃料需要每日结算。", "不同阵营拥有不同长期目标。"]
  }
}

export function npcChat(payload: {
  npc_id: string
  npc_name: string
  npc_role: string
  player_name: string
  message: string
  location: string
  npc_status?: string
  npc_personality?: string
}): Promise<{ reply?: string; message?: string; content?: string }> {
  return jsonFetch(`${AI_DM_API}/npc/chat`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
