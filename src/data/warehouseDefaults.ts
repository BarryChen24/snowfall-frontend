// 仓库初始库存 — 从 覆雪之下/仓库物资.doc 提取
// 对应 items.ts 中的物品 ID

import type { ItemType } from "./items"

export interface WarehouseDefault {
  key: string
  name: string
  description: string
  stock: Array<{ itemType: ItemType; itemId: number; quantity: number }>
}

export const WAREHOUSE_DEFAULTS: WarehouseDefault[] = [
  {
    key: "fuel_depot",
    name: "燃料仓库",
    description: "位于警察局，存放燃料、照明、取暖相关物品",
    stock: [
      // 物资(material): 5=食物, 8=燃料, 2=木材
      { itemType: "material", itemId: 8, quantity: 150 },   // 煤油 150升
      { itemType: "material", itemId: 2, quantity: 50000 },  // 木材 50000kg
      // 道具(item): 15=点火工具(火柴)
      { itemType: "item", itemId: 15, quantity: 2 },        // 火柴 2盒
      { itemType: "item", itemId: 13, quantity: 20 },       // 照明工具(蜡烛) 20支
      { itemType: "item", itemId: 2, quantity: 8 },         // 手电筒 8个
    ],
  },
  {
    key: "town_armory",
    name: "镇武库",
    description: "位于镇长厅，存放武器、弹药、防具、警用器械",
    stock: [
      { itemType: "weapon", itemId: 1, quantity: 2 },       // 制式手枪 2把
      { itemType: "ammo", itemId: 1, quantity: 4 },         // 手枪弹 4发
      { itemType: "weapon", itemId: 2, quantity: 1 },       // 猎枪 1把
      { itemType: "weapon", itemId: 4, quantity: 2 },       // 刺刀 2把
      { itemType: "weapon", itemId: 3, quantity: 3 },       // 警棍 3根
      { itemType: "item", itemId: 6, quantity: 2 },         // 复合盾 2面
      { itemType: "item", itemId: 5, quantity: 1 },         // 防弹衣 1件
      { itemType: "material", itemId: 12, quantity: 1 },    // 发电机 1台
    ],
  },
  {
    key: "mine_warehouse",
    name: "矿场仓库",
    description: "位于矿场，存放工具、建材、金属、石料、维修物品",
    stock: [
      { itemType: "material", itemId: 1, quantity: 50000 }, // 金属制品 50000kg
      { itemType: "material", itemId: 7, quantity: 5000 },  // 石料 5000kg
      { itemType: "material", itemId: 4, quantity: 80 },    // 木板 80kg
      { itemType: "material", itemId: 3, quantity: 60 },    // 绳索 60米
      { itemType: "material", itemId: 9, quantity: 20 },    // 帆布 20米
      { itemType: "weapon", itemId: 8, quantity: 2 },       // 十字镐 2把
      { itemType: "weapon", itemId: 9, quantity: 1 },       // 斧头 1把
      { itemType: "item", itemId: 8, quantity: 1 },         // 维修工具包 1包
      { itemType: "material", itemId: 12, quantity: 1 },    // 发电机 1台(需维修)
    ],
  },
  {
    key: "dock_collection",
    name: "码头集购仓",
    description: "位于码头，存放食物、船用物资、贸易品、杂货",
    stock: [
      { itemType: "material", itemId: 5, quantity: 100 },   // 食物 100单位
      { itemType: "item", itemId: 18, quantity: 1 },        // 食物补给(便当) 1份
      { itemType: "item", itemId: 10, quantity: 20 },       // 朗姆酒 20瓶
      { itemType: "item", itemId: 14, quantity: 5 },        // 医用酒精 5升
      { itemType: "item", itemId: 1, quantity: 1 },         // 医疗包 1包
      { itemType: "item", itemId: 12, quantity: 1 },        // 渔网 1副
      { itemType: "weapon", itemId: 6, quantity: 1 },       // 鱼叉/矛 1把
      { itemType: "item", itemId: 7, quantity: 1 },         // 信号枪 1把
      { itemType: "ammo", itemId: 3, quantity: 2 },         // 信号弹 2发
      { itemType: "item", itemId: 17, quantity: 1 },        // 导航工具(破损海图) 1张
      { itemType: "material", itemId: 11, quantity: 1 },    // 螺旋桨 1个
    ],
  },
]
