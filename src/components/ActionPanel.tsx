import { useState } from "react"
import {
  getStoredPlayerId,
  submitDayAction,
  submitFactionAction,
  submitNightAction,
  submitQuickInteraction,
  type QuickInteractionType,
} from "../services/api"

type Tab = "day" | "quick" | "faction" | "night"

export default function ActionPanel() {
  const [tab, setTab] = useState<Tab>("day")
  const [actionType, setActionType] = useState("")
  const [target, setTarget] = useState("")
  const [note, setNote] = useState("")
  const [quickType, setQuickType] = useState<QuickInteractionType>("quick_action")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    setMessage("")
    const playerId = getStoredPlayerId()
    try {
      if (tab === "day") await submitDayAction({ playerId, actionType, target, note } as any)
      if (tab === "faction") await submitFactionAction({ playerId, actionType, target, note } as any)
      if (tab === "night") await submitNightAction({ playerId, actionType, target, note } as any)
      if (tab === "quick") await submitQuickInteraction({ playerId, type: quickType, content: note } as any)
      setMessage("已提交，等待主持人反馈。")
      setActionType("")
      setTarget("")
      setNote("")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "提交失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="action-panel">
      <div className="panel-title">行动提交</div>
      <div className="tab-row compact">
        {(["day", "quick", "faction", "night"] as Tab[]).map((item) => (
          <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}>
            {item === "day" ? "白天" : item === "quick" ? "快速" : item === "faction" ? "阵营" : "夜晚"}
          </button>
        ))}
      </div>

      {tab === "quick" ? (
        <select value={quickType} onChange={(e) => setQuickType(e.target.value as QuickInteractionType)}>
          <option value="quick_action">快速行动</option>
          <option value="note">补充说明</option>
          <option value="rules_question">规则咨询</option>
          <option value="ask_dm">询问 DM</option>
        </select>
      ) : (
        <>
          <input placeholder="行动类型" value={actionType} onChange={(e) => setActionType(e.target.value)} />
          <input placeholder="目标，可填地点 / NPC / 玩家" value={target} onChange={(e) => setTarget(e.target.value)} />
        </>
      )}
      <textarea placeholder="备注或行动内容" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="primary-button" onClick={submit} disabled={loading}>
        {loading ? "提交中..." : "提交"}
      </button>
      {message && <div className="submit-message">{message}</div>}
    </aside>
  )
}
