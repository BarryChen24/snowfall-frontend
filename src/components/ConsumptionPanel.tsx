import { useEffect, useState } from "react"
import {
  getConsumptionContext,
  getStoredPlayer,
  submitConsumption,
  type ConsumptionContext,
} from "../services/api"

interface Props {
  gameDay: number
  onSubmitted?: () => void
}

export default function ConsumptionPanel({ gameDay, onSubmitted }: Props) {
  const player = getStoredPlayer()
  const playerId = String(player?.id || "1")
  const [ctx, setCtx] = useState<ConsumptionContext | null>(null)
  const [foodUnits, setFoodUnits] = useState("")
  const [woodKg, setWoodKg] = useState("")
  const [fuelKg, setFuelKg] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    getConsumptionContext(playerId, gameDay).then((data) => {
      if (cancelled) return
      setCtx(data)
      setFoodUnits(String(Math.max(0, data.remainingFoodUnits || 0)))
      setFuelKg(String(Math.max(0, data.remainingFuelKg || 0)))
    })
    return () => {
      cancelled = true
    }
  }, [playerId, gameDay])

  async function submit(confirmOverFuel = false) {
    if (!ctx || loading) return
    const food = Number(foodUnits || 0)
    const wood = Number(woodKg || 0)
    const fuel = Number(fuelKg || 0)

    if (food > ctx.availableFoodUnits) {
      setMessage("提交食物超过当前可用库存。")
      return
    }
    if (fuel > ctx.availableFuelKg) {
      setMessage("提交燃料超过当前可用库存。")
      return
    }
    if (!confirmOverFuel && fuel > ctx.remainingFuelKg && !window.confirm("提交燃料超过今日所需，确认继续？")) {
      return
    }

    setLoading(true)
    setMessage("")
    try {
      const next = await submitConsumption({
        playerId,
        gameDay,
        foodUnits: food,
        woodKg: wood,
        fuelKg: fuel,
        confirmOverFuel,
      })
      setCtx(next)
      setMessage(next.message || "消耗提交成功。")
      onSubmitted?.()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "提交失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="consumption-panel">
      <div className="panel-title">每日消耗</div>
      {!ctx ? (
        <div className="empty">正在读取今日消耗需求...</div>
      ) : (
        <>
          <div className="consumption-grid">
            <div>
              <span>食物需求</span>
              <b>{ctx.consumedFoodUnits}/{ctx.requiredFoodUnits}</b>
              <small>剩余 {ctx.remainingFoodUnits}，可用 {ctx.availableFoodUnits}</small>
            </div>
            <div>
              <span>燃料需求</span>
              <b>{ctx.consumedFuelKg}/{ctx.requiredFuelKg} kg</b>
              <small>剩余 {ctx.remainingFuelKg} kg，可用 {ctx.availableFuelKg} kg</small>
            </div>
          </div>

          <label>提交食物份数</label>
          <input value={foodUnits} onChange={(e) => setFoodUnits(e.target.value)} inputMode="decimal" />
          <label>提交木材 kg</label>
          <input value={woodKg} onChange={(e) => setWoodKg(e.target.value)} inputMode="decimal" />
          <label>提交燃料 kg</label>
          <input value={fuelKg} onChange={(e) => setFuelKg(e.target.value)} inputMode="decimal" />

          <button className="primary-button" onClick={() => submit()} disabled={loading}>
            {loading ? "提交中..." : "提交今日消耗"}
          </button>
          {message && <div className="submit-message">{message}</div>}
        </>
      )}
    </section>
  )
}
