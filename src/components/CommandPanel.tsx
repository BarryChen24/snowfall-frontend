import { useState } from "react"
import ActionPanel from "./ActionPanel"
import ConsumptionPanel from "./ConsumptionPanel"
import FactionPanel from "./FactionPanel"
import FeedbackPanel from "./FeedbackPanel"
import LorePanel from "./LorePanel"
import StoragePanel from "./StoragePanel"
import TradePanel from "./TradePanel"

type ConsoleTab = "actions" | "storage" | "trade" | "faction" | "lore"

const tabs: Array<{ id: ConsoleTab; label: string }> = [
  { id: "actions", label: "行动" },
  { id: "storage", label: "库存" },
  { id: "trade", label: "交易" },
  { id: "faction", label: "阵营" },
  { id: "lore", label: "百科" },
]

interface Props {
  gameDay: number
}

export default function CommandPanel({ gameDay }: Props) {
  const [active, setActive] = useState<ConsoleTab>("actions")
  const [feedbackRefresh, setFeedbackRefresh] = useState(0)

  return (
    <section className="command-panel">
      <div className="console-tabs">
        {tabs.map((tab) => (
          <button className={active === tab.id ? "active" : ""} key={tab.id} onClick={() => setActive(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {active === "actions" && (
        <div className="action-stack">
          <ActionPanel />
          <ConsumptionPanel gameDay={gameDay} onSubmitted={() => setFeedbackRefresh((value) => value + 1)} />
          <FeedbackPanel refreshKey={feedbackRefresh} />
        </div>
      )}
      {active === "storage" && <StoragePanel />}
      {active === "trade" && <TradePanel />}
      {active === "faction" && <FactionPanel />}
      {active === "lore" && <LorePanel />}
    </section>
  )
}
