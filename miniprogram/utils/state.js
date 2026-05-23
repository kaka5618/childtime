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

function rollPack() {
  const collection = getCollection()
  const missing = cards.filter((card) => !collection[card.id])
  const guaranteed = missing.length ? missing[0] : cards[0]
  const pool = cards.filter((card) => card.rarity === 'N' || card.rarity === 'R')
  const extra = pool[Math.floor(Math.random() * pool.length)]
  const pack = [guaranteed, extra].filter(Boolean)

  pack.forEach((card) => {
    collection[card.id] = (collection[card.id] || 0) + 1
  })

  saveCollection(collection)
  saveLastPack(pack)
  wx.setStorageSync(PACK_GENERATED_DATE_KEY, todayKey())
  return pack
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
  rollPack
}
