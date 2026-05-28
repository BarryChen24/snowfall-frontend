import { useEffect, useState } from "react"
import { getActionFeedback, getStoredPlayer, type ActionFeedbackItem } from "../services/api"

interface Props {
  refreshKey?: number
}

export default function FeedbackPanel({ refreshKey = 0 }: Props) {
  const player = getStoredPlayer()
  const playerId = String(player?.id || "1")
  const [items, setItems] = useState<ActionFeedbackItem[]>([])
  const [dayFilter, setDayFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getActionFeedback(playerId)
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [playerId, refreshKey])

  const visible = dayFilter ? items.filter((item) => String(item.day || "") === dayFilter) : items

  return (
    <section className="action-feedback">
      <div className="panel-title">行动反馈</div>
      <input
        className="inline-filter"
        inputMode="numeric"
        placeholder="按天数筛选，可留空"
        value={dayFilter}
        onChange={(e) => setDayFilter(e.target.value)}
      />
      {loading ? (
        <div className="empty">正在读取主持人反馈...</div>
      ) : visible.length === 0 ? (
        <div className="empty">暂无反馈。提交行动后会显示在这里。</div>
      ) : (
        <div className="feedback-list">
          {visible.map((item) => (
            <article key={item.id} className="feedback-card">
              <header>
                <strong>{item.title || item.actionType || "行动反馈"}</strong>
                <span>{item.day ? `第 ${item.day} 天` : ""} {item.phase || ""}</span>
              </header>
              {item.result && <p>{item.result}</p>}
              {item.reward && <div className="feedback-reward">获得：{item.reward}</div>}
              {item.status && <small>{item.status}</small>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
