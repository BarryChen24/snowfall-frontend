import { useEffect, useState } from "react"
import CommandPanel from "./components/CommandPanel"
import LoginPage from "./components/LoginPage"
import OverviewMap from "./components/OverviewMap"
import StatusPanel from "./components/StatusPanel"
import {
  getGameState,
  getPlayerDetails,
  getPlayerResources,
  getStoredPlayer,
  isLoggedIn,
  logout,
  type GameState,
  type PlayerResources,
} from "./services/api"

type MobileTab = "map" | "status" | "console"

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [resources, setResources] = useState<PlayerResources | null>(null)
  const [player, setPlayer] = useState(getStoredPlayer())
  const [mobileTab, setMobileTab] = useState<MobileTab>("map")

  useEffect(() => {
    if (!loggedIn) return
    let cancelled = false

    async function load() {
      const stored = getStoredPlayer()
      const playerId = stored?.id ? String(stored.id) : localStorage.getItem("playerId")
      try {
        const [state, details, res] = await Promise.all([
          getGameState().catch(() => null),
          playerId ? getPlayerDetails(playerId).catch(() => null) : Promise.resolve(null),
          playerId ? getPlayerResources(playerId).catch(() => null) : Promise.resolve(null),
        ])
        if (cancelled) return
        if (state) setGameState(state)
        if (details) {
          const nextPlayer = { ...stored, ...details }
          setPlayer(nextPlayer)
          localStorage.setItem("snowfall_player", JSON.stringify(nextPlayer))
        }
        if (res) setResources(res)
      } catch {
        // 地图和 NPC 展示依赖本地副本，后端短暂不可用时仍然可以浏览。
      }
    }

    load()
    const timer = window.setInterval(load, 30_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [loggedIn])

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={() => {
          setPlayer(getStoredPlayer())
          setLoggedIn(true)
        }}
      />
    )
  }

  const gameDay = gameState?.day || 1
  const status = (
    <StatusPanel
      gameState={gameState}
      resources={resources}
      player={player}
      onLogout={() => {
        logout()
        setLoggedIn(false)
      }}
    />
  )
  const consolePanel = <CommandPanel gameDay={gameDay} />

  return (
    <div className="app-shell" data-mobile-tab={mobileTab}>
      <header className="topbar">
        <div className="brand">
          <span>☯</span>
          <div>
            <strong>覆雪之下</strong>
            <small>永不落幕的梦</small>
          </div>
        </div>
        <div className="phase-chip">阶段：{gameState?.phase || "同步中"}</div>
      </header>

      <OverviewMap />

      <div className="desktop-status">{status}</div>
      <div className="desktop-actions">{consolePanel}</div>

      {mobileTab === "status" && <div className="mobile-sheet">{status}</div>}
      {mobileTab === "console" && <div className="mobile-sheet">{consolePanel}</div>}

      <nav className="mobile-nav" aria-label="移动端导航">
        <button className={mobileTab === "map" ? "active" : ""} onClick={() => setMobileTab("map")}>
          <span>地图</span>
        </button>
        <button className={mobileTab === "status" ? "active" : ""} onClick={() => setMobileTab("status")}>
          <span>状态</span>
        </button>
        <button className={mobileTab === "console" ? "active" : ""} onClick={() => setMobileTab("console")}>
          <span>控制台</span>
        </button>
      </nav>
    </div>
  )
}
