import { useEffect, useMemo, useState } from "react"
import {
  getPlayerItems,
  getStoredPlayerId,
  getWarehouseStock,
  getWarehouses,
  type InventoryItem,
  type WarehouseStockItem,
  type WarehouseSummary,
} from "../services/api"

const typeLabel: Record<string, string> = {
  item: "道具",
  weapon: "武器",
  ammo: "弹药",
  material: "物资",
}

function ItemRows({ items, emptyText }: { items: Array<InventoryItem | WarehouseStockItem>; emptyText: string }) {
  if (!items.length) return <div className="empty">{emptyText}</div>
  return (
    <div className="item-list">
      {items.map((item) => {
        const type = item.itemType || item.type || "item"
        return (
          <article className="item-row" key={`${type}-${item.id}`}>
            <div>
              <strong>{item.name}</strong>
              <span>{typeLabel[type] || type}</span>
            </div>
            <b>{item.quantity}{item.unit || ""}</b>
          </article>
        )
      })}
    </div>
  )
}

export default function StoragePanel() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseSummary[]>([])
  const [activeWarehouse, setActiveWarehouse] = useState("")
  const [stock, setStock] = useState<WarehouseStockItem[]>([])
  const [filter, setFilter] = useState("all")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getPlayerItems(getStoredPlayerId()), getWarehouses()])
      .then(([bag, wh]) => {
        if (cancelled) return
        setItems(bag)
        setWarehouses(wh)
        setActiveWarehouse(wh[0]?.warehouseKey || "")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!activeWarehouse) return
    let cancelled = false
    getWarehouseStock(activeWarehouse).then((data) => {
      if (!cancelled) setStock(data)
    })
    return () => {
      cancelled = true
    }
  }, [activeWarehouse])

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      const type = item.itemType || item.type || "item"
      return (filter === "all" || type === filter) && (!q || item.name.toLowerCase().includes(q))
    })
  }, [filter, items, query])

  return (
    <section className="compact-panel">
      <div className="panel-title">背包与仓库</div>
      <div className="control-row">
        <input placeholder="搜索我的物品" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">全部</option>
          <option value="material">物资</option>
          <option value="item">道具</option>
          <option value="weapon">武器</option>
          <option value="ammo">弹药</option>
        </select>
      </div>

      {loading ? (
        <div className="empty">正在读取库存...</div>
      ) : (
        <>
          <h3 className="subhead">我的物品</h3>
          <ItemRows items={visibleItems} emptyText="背包里没有匹配物品。" />

          <h3 className="subhead">公共仓库</h3>
          <div className="pill-row">
            {warehouses.map((warehouse) => (
              <button
                className={activeWarehouse === warehouse.warehouseKey ? "active" : ""}
                key={warehouse.warehouseKey}
                onClick={() => setActiveWarehouse(warehouse.warehouseKey)}
              >
                {warehouse.name || warehouse.warehouseName || warehouse.warehouseKey}
              </button>
            ))}
          </div>
          <ItemRows items={stock} emptyText="当前仓库没有公开库存。" />
        </>
      )}
    </section>
  )
}
