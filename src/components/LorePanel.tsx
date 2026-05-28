import { useEffect, useState } from "react"
import { getRuleBook } from "../services/api"

export default function LorePanel() {
  const [entries, setEntries] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    getRuleBook().then((data) => {
      if (!cancelled) setEntries(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="compact-panel">
      <div className="panel-title">百科</div>
      <div className="rule-list">
        {entries.map((entry, index) => (
          <article key={`${entry}-${index}`}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <span>{entry}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
