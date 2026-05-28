import { useEffect, useState } from "react"
import { getFactionProgress, getStoredPlayer, type ProgressSummary } from "../services/api"

function percent(current: number, max: number) {
  if (!max) return 0
  return Math.max(0, Math.min(100, (current / max) * 100))
}

export default function FactionPanel() {
  const faction = getStoredPlayer()?.faction || "冒险者"
  const [items, setItems] = useState<ProgressSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getFactionProgress(faction)
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [faction])

  return (
    <section className="compact-panel">
      <div className="panel-title">阵营进度</div>
      <div className="status-box">当前阵营：{faction}</div>
      {loading ? (
        <div className="empty">正在读取阵营进度...</div>
      ) : items.length === 0 ? (
        <div className="empty">当前阵营暂无公开进度。</div>
      ) : (
        <div className="progress-list">
          {items.map((item) => (
            <article className="progress-card" key={item.title}>
              <header>
                <strong>{item.title}</strong>
                <b>{Math.round(item.progress)}%</b>
              </header>
              <div className="progress-track">
                <span style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }} />
              </div>
              {item.description && <p>{item.description}</p>}
              {item.status && <small>{item.status}</small>}
              {item.resources?.map((resource) => (
                <div className="resource-line" key={resource.name}>
                  <span>{resource.name}</span>
                  <b>{resource.current}/{resource.max}{resource.unit || ""}</b>
                  <i><em style={{ width: `${percent(resource.current, resource.max)}%` }} /></i>
                </div>
              ))}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
