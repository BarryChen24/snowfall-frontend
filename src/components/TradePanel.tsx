import { useEffect, useState } from "react"
import { getTrades, type TradeItem } from "../services/api"

const statusLabel: Record<string, string> = {
  pending: "待处理",
  accepted: "已接受",
  completed: "已完成",
  rejected: "已拒绝",
}

export default function TradePanel() {
  const [trades, setTrades] = useState<TradeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getTrades()
      .then((data) => {
        if (!cancelled) setTrades(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="compact-panel">
      <div className="panel-title">交易市场</div>
      {loading ? (
        <div className="empty">正在读取交易...</div>
      ) : trades.length === 0 ? (
        <div className="empty">暂无交易记录。</div>
      ) : (
        <div className="feedback-list">
          {trades.map((trade) => (
            <article className="feedback-card" key={trade.id}>
              <header>
                <strong>{trade.fromPlayerName || "发起方"} → {trade.toPlayerName || "接收方"}</strong>
                <span>{statusLabel[String(trade.status || "")] || trade.status || "未知"}</span>
              </header>
              {trade.remark && <p>{trade.remark}</p>}
              {trade.createdAt && <small>{new Date(trade.createdAt).toLocaleString()}</small>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
