const { cards } = require('./cards')

const TASKS_KEY = 'childtime_tasks'
const COLLECTION_KEY = 'childtime_collection'
const PACK_KEY = 'childtime_last_pack'
const PACK_DATE_KEY = 'childtime_pack_date'
const PACK_GENERATED_DATE_KEY = 'childtime_pack_generated_date'

function todayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function taskStorageKey() {
  return `${TASKS_KEY}_${todayKey()}`
}

function getTasks() {
  return wx.getStorageSync(taskStorageKey()) || []
}

function saveTasks(tasks) {
  wx.setStorageSync(taskStorageKey(), tasks)
}

function getCollection() {
  return wx.getStorageSync(COLLECTION_KEY) || {}
}

function saveCollection(collection) {
  wx.setStorageSync(COLLECTION_KEY, collection)
}

function getLastPack() {
  return wx.getStorageSync(PACK_KEY) || []
}

function saveLastPack(pack) {
  wx.setStorageSync(PACK_KEY, pack)
}

function hasOpenedToday() {
  return wx.getStorageSync(PACK_DATE_KEY) === todayKey()
}

function markOpenedToday() {
  wx.setStorageSync(PACK_DATE_KEY, todayKey())
}

function hasGeneratedToday() {
  return wx.getStorageSync(PACK_GENERATED_DATE_KEY) === todayKey()
}

function chargePercent(tasks) {
  const total = tasks.reduce((sum, task) => sum + Number(task.minutes || 0), 0)
  if (!total) return 0
  const done = tasks
    .filter((task) => task.completed)
    .reduce((sum, task) => sum + Number(task.minutes || 0), 0)
  return Math.min(100, Math.round((done / total) * 100))
}

function allCompleted(tasks) {
  return tasks.length > 0 && tasks.every((task) => task.completed)
}

function buildPack(collection, options = {}) {
  const excludedIds = options.excludedIds || []
  const missing = cards.filter((card) => !collection[card.id] && !excludedIds.includes(card.id))
  const guaranteed = missing.length ? missing[0] : cards[0]
  const pool = cards.filter((card) => {
    return (card.rarity === 'N' || card.rarity === 'R') && !excludedIds.includes(card.id)
  })
  const extra = pool[Math.floor(Math.random() * pool.length)]
  return [guaranteed, extra].filter(Boolean)
}

function addPackToCollection(collection, pack) {
  pack.forEach((card) => {
    collection[card.id] = (collection[card.id] || 0) + 1
  })
}

function rollPack() {
  const collection = getCollection()
  const pack = buildPack(collection)

  addPackToCollection(collection, pack)

  saveCollection(collection)
  saveLastPack(pack)
  wx.setStorageSync(PACK_GENERATED_DATE_KEY, todayKey())
  return pack
}

function synthesizePack(sourceCardId) {
  const collection = getCollection()
  const count = collection[sourceCardId] || 0

  if (count < 4) {
    return {
      ok: false,
      message: '数量不足，4 张重复卡可合成 1 包',
      pack: []
    }
  }

  collection[sourceCardId] = count - 4
  if (collection[sourceCardId] <= 0) delete collection[sourceCardId]

  const pack = buildPack(collection, { excludedIds: [sourceCardId] })
  addPackToCollection(collection, pack)
  saveCollection(collection)
  saveLastPack(pack)

  return {
    ok: true,
    message: '',
    pack
  }
}

module.exports = {
  getTasks,
  saveTasks,
  getCollection,
  saveCollection,
  getLastPack,
  saveLastPack,
  hasOpenedToday,
  markOpenedToday,
  hasGeneratedToday,
  chargePercent,
  allCompleted,
  rollPack,
  synthesizePack
}
