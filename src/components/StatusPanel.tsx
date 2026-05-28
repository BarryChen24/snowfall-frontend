import type { GameState, PlayerResources } from "../services/api"

interface Props {
  gameState: GameState | null
  resources: PlayerResources | null
  player?: { name?: string; faction?: string; role?: string }
  onLogout: () => void
}

export default function StatusPanel({ gameState, resources, player, onLogout }: Props) {
  return (
    <aside className="status-panel">
      <div className="panel-title">玩家状态</div>
      <div className="stat-row"><span>玩家</span><b>{player?.name || "未知"}</b></div>
      <div className="stat-row"><span>阵营</span><b>{player?.faction || "未同步"}</b></div>
      <div className="stat-row"><span>职业</span><b>{player?.role || "未同步"}</b></div>
      <div className="split" />
      <div className="stat-row"><span>天数</span><b>第 {gameState?.day ?? "?"} 天</b></div>
      <div className="stat-row"><span>阶段</span><b>{gameState?.phase || "未知"}</b></div>
      <div className="stat-row"><span>天气</span><b>{gameState?.weather || "未同步"}</b></div>
      <div className="split" />
      <div className="resource-grid">
        <div><span>食物</span><b>{resources?.food ?? "-"}</b></div>
        <div><span>燃料</span><b>{resources?.fuel ?? "-"}</b></div>
        <div><span>材料</span><b>{resources?.materials ?? "-"}</b></div>
        <div><span>药品</span><b>{resources?.medicine ?? "-"}</b></div>
      </div>
      <button className="ghost-button" onClick={onLogout}>退出登录</button>
    </aside>
  )
}
