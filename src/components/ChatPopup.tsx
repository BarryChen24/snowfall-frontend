import { useState } from "react"
import type { NPCInfo } from "../data/locations"
import { getStoredPlayer, npcChat } from "../services/api"

interface Props {
  npc: NPCInfo
  locationName: string
  onClose: () => void
}

interface ChatLine {
  role: "player" | "npc"
  text: string
}

export default function ChatPopup({ npc, locationName, onClose }: Props) {
  const [lines, setLines] = useState<ChatLine[]>([
    { role: "npc", text: `${npc.name}看向你，等你先开口。` },
  ])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function send() {
    const message = text.trim()
    if (!message || loading) return
    setText("")
    setLines((prev) => [...prev, { role: "player", text: message }])
    setLoading(true)
    try {
      const player = getStoredPlayer()
      const resp = await npcChat({
        npc_id: npc.id,
        npc_name: npc.name,
        npc_role: npc.role,
        player_name: player?.name || "旅人",
        message,
        location: locationName,
        npc_status: npc.status,
        npc_personality: npc.description,
      })
      setLines((prev) => [
        ...prev,
        { role: "npc", text: resp.reply || resp.message || resp.content || "对方沉默了片刻。" },
      ])
    } catch (err) {
      setLines((prev) => [
        ...prev,
        { role: "npc", text: `对话出错：${err instanceof Error ? err.message : "未知错误"}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-popup">
      <div className="chat-head">
        <div>
          <strong>{npc.name}</strong>
          <span>{npc.nameEn} · {npc.role} · {locationName}</span>
        </div>
        <button aria-label="关闭对话" onClick={onClose}>×</button>
      </div>
      <div className="chat-lines">
        {lines.map((line, index) => (
          <div key={index} className={`chat-line ${line.role}`}>
            {line.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="输入你想说的话..."
        />
        <button onClick={send} disabled={loading}>{loading ? "..." : "发送"}</button>
      </div>
    </div>
  )
}
