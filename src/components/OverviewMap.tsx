import { useMemo, useRef, useState } from "react"
import locations, { type LocationData, type NPCInfo } from "../data/locations"
import ChatPopup from "./ChatPopup"
import LocationPanel from "./LocationPanel"

export default function OverviewMap() {
  const [selected, setSelected] = useState<LocationData | null>(null)
  const [chatNpc, setChatNpc] = useState<NPCInfo | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const snow = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 9 + Math.random() * 11,
        delay: Math.random() * 12,
      })),
    [],
  )

  function toggleZoom() {
    setScale((value) => (value === 1 ? 1.75 : 1))
    setOffset({ x: 0, y: 0 })
  }

  return (
    <main className="overview-shell">
      <div
        ref={viewportRef}
        className="map-viewport"
        onDoubleClick={toggleZoom}
        onMouseDown={(e) => scale > 1 && setDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y })}
        onMouseMove={(e) => drag && setOffset({ x: e.clientX - drag.x, y: e.clientY - drag.y })}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}
      >
        <div
          className="map-stage"
          style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})` }}
        >
          <img src="/assets/island_overview.png" alt="海岛小镇地图" draggable={false} />
          {locations.map((location) => (
            <button
              className={`hotspot ${selected?.id === location.id ? "active" : ""}`}
              key={location.id}
              style={
                {
                  left: `${location.x * 100}%`,
                  top: `${location.y * 100}%`,
                  "--hotspot": location.color,
                } as React.CSSProperties
              }
              onClick={(e) => {
                e.stopPropagation()
                setSelected(location)
              }}
            >
              <span />
              <b>{location.name}</b>
            </button>
          ))}
        </div>

        {snow.map((flake) => (
          <i
            className="snowflake"
            key={flake.id}
            style={{
              left: `${flake.left}%`,
              width: flake.size,
              height: flake.size,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
            }}
          />
        ))}

        <div className="map-hint">双击缩放 · 拖拽平移 · 点击地点查看 NPC 与行动信息</div>
      </div>

      {selected && (
        <LocationPanel
          location={selected}
          onClose={() => setSelected(null)}
          onChat={(npc) => setChatNpc(npc)}
        />
      )}

      {chatNpc && selected && (
        <ChatPopup npc={chatNpc} locationName={selected.name} onClose={() => setChatNpc(null)} />
      )}
    </main>
  )
}
