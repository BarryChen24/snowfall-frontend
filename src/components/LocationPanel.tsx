import type { LocationData, NPCInfo } from "../data/locations"

interface Props {
  location: LocationData
  onClose: () => void
  onChat: (npc: NPCInfo) => void
}

function AttitudeTags({
  label,
  values,
  tone,
}: {
  label: string
  values: string[]
  tone: "good" | "bad" | "neutral"
}) {
  if (!values.length) return null
  return (
    <div className={`attitude ${tone}`}>
      <span>{label}</span>
      {values.map((value) => (
        <b key={value}>{value}</b>
      ))}
    </div>
  )
}

export default function LocationPanel({ location, onClose, onChat }: Props) {
  return (
    <section className="location-panel">
      <header style={{ borderColor: location.color }}>
        <div>
          <h2>{location.name}</h2>
          <p>{location.nameEn}</p>
        </div>
        <button aria-label="关闭地点面板" onClick={onClose}>×</button>
      </header>

      <div className="location-body">
        <p className="description">{location.description}</p>
        <div className="status-box">地点状态：{location.status}</div>

        <div className="tag-row">
          {location.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <h3>当前 NPC</h3>
        {location.npcs.length === 0 ? (
          <div className="empty">此地点暂无公开 NPC。调查后可能解锁更多信息。</div>
        ) : (
          <div className="npc-list">
            {location.npcs.map((npc) => (
              <article className="npc-card" key={npc.id}>
                <div className="npc-avatar">{npc.gender === "女" ? "女" : "男"}</div>
                <div className="npc-main">
                  <div className="npc-title">
                    <strong>{npc.name}</strong>
                    <span>{npc.nameEn}</span>
                  </div>
                  <div className="npc-role">{npc.role} · {npc.status || "状态未知"}</div>
                  <p>{npc.description}</p>
                  <AttitudeTags label="喜好" values={npc.factionAttitude.likes} tone="good" />
                  <AttitudeTags label="厌恶" values={npc.factionAttitude.hates} tone="bad" />
                  <AttitudeTags label="忽视" values={npc.factionAttitude.ignores} tone="neutral" />
                </div>
                <button className="chat-button" onClick={() => onChat(npc)}>对话</button>
              </article>
            ))}
          </div>
        )}

        <h3>今日流言</h3>
        <div className="rumor-list">
          {location.rumors.map((rumor) => (
            <div key={rumor}>{rumor}</div>
          ))}
        </div>

        <h3>经济</h3>
        <div className="economy-box">{location.economy}</div>
      </div>
    </section>
  )
}
