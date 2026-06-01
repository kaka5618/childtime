const { getCardsBySeries } = require('./cards')

const TASKS_KEY = 'childtime_tasks'
const COLLECTION_KEY = 'childtime_collection'
const PACK_KEY = 'childtime_last_pack'
const PACK_DATE_KEY = 'childtime_pack_date'
const PACK_GENERATED_DATE_KEY = 'childtime_pack_generated_date'
const ACTIVE_SERIES_KEY = 'childtime_active_series'
const LAST_SWITCH_DATE_KEY = 'childtime_last_switch_date'
const SETTINGS_KEY = 'childtime_settings'
const SWITCH_COOLDOWN_DAYS = 15
const DEFAULT_SETTINGS = {
  voiceEnabled: true,
  voiceType: 'gentle',
  volume: 60
}
const PACK_SIZE_WEIGHTS = [
  { size: 1, weight: 10 },
  { size: 2, weight: 30 },
  { size: 3, weight: 35 },
  { size: 4, weight: 20 },
  { size: 5, weight: 5 }
]
const RARITY_WEIGHTS = [
  { rarity: 'SSR', weight: 3 },
  { rarity: 'SR', weight: 12 },
  { rarity: 'R', weight: 30 },
  { rarity: 'N', weight: 55 }
]
const SYNTHESIS_REQUIRED_COUNT = 4
const SYNTHESIS_CONSUME_COUNT = 3

function todayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateFromKey(dateKey) {
  const parts = String(dateKey || '').split('-').map(Number)
  if (parts.length !== 3 || parts.some((part) => !part)) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

function addDays(dateKey, days) {
  const date = dateFromKey(dateKey)
  if (!date) return ''
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function daysBetween(startKey, endKey) {
  const start = dateFromKey(startKey)
  const end = dateFromKey(endKey)
  if (!start || !end) return 0
  const dayMs = 24 * 60 * 60 * 1000
  return Math.floor((end.getTime() - start.getTime()) / dayMs)
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

function getSettings() {
  return {
    ...DEFAULT_SETTINGS,
    ...(wx.getStorageSync(SETTINGS_KEY) || {})
  }
}

function saveSettings(settings) {
  wx.setStorageSync(SETTINGS_KEY, {
    ...getSettings(),
    ...settings
  })
}

function getActiveSeriesId() {
  const seriesId = wx.getStorageSync(ACTIVE_SERIES_KEY)
  if (seriesId) {
    if (!wx.getStorageSync(LAST_SWITCH_DATE_KEY)) {
      wx.setStorageSync(LAST_SWITCH_DATE_KEY, todayKey())
    }
    return seriesId
  }

  const hasExistingProgress = Object.keys(getCollection()).length > 0 || getTasks().length > 0
  if (hasExistingProgress) {
    setActiveSeriesId('star_dream_bubble')
    return 'star_dream_bubble'
  }

  return ''
}

function setActiveSeriesId(seriesId) {
  wx.setStorageSync(ACTIVE_SERIES_KEY, seriesId)
  wx.setStorageSync(LAST_SWITCH_DATE_KEY, todayKey())
}

function hasSelectedSeries() {
  return Boolean(getActiveSeriesId())
}

function getLastSwitchDate() {
  return wx.getStorageSync(LAST_SWITCH_DATE_KEY) || ''
}

function getNextSwitchDate() {
  const lastSwitchDate = getLastSwitchDate()
  return lastSwitchDate ? addDays(lastSwitchDate, SWITCH_COOLDOWN_DAYS) : ''
}

function getSwitchCooldownInfo(targetSeriesId) {
  const activeSeriesId = getActiveSeriesId()
  const lastSwitchDate = getLastSwitchDate()

  if (!activeSeriesId || activeSeriesId === targetSeriesId || !lastSwitchDate) {
    return {
      canSwitch: true,
      remainingDays: 0,
      nextSwitchDate: getNextSwitchDate()
    }
  }

  const elapsedDays = daysBetween(lastSwitchDate, todayKey())
  const remainingDays = Math.max(0, SWITCH_COOLDOWN_DAYS - elapsedDays)

  return {
    canSwitch: remainingDays === 0,
    remainingDays,
    nextSwitchDate: getNextSwitchDate()
  }
}

function getCollection() {
  const collection = wx.getStorageSync(COLLECTION_KEY) || {}
  const looksLikeLegacyCollection = Object.keys(collection).some((key) => {
    return typeof collection[key] === 'number'
  })

  if (!looksLikeLegacyCollection) return collection

  const migrated = {
    star_dream_bubble: collection
  }
  saveCollection(migrated)
  return migrated
}

function saveCollection(collection) {
  wx.setStorageSync(COLLECTION_KEY, collection)
}

function getSeriesCollection(seriesId) {
  return getCollection()[seriesId] || {}
}

function saveSeriesCollection(seriesId, seriesCollection) {
  const collection = getCollection()
  collection[seriesId] = seriesCollection
  saveCollection(collection)
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

function getCollectionProgress(seriesId = getActiveSeriesId()) {
  const cards = getCardsBySeries(seriesId)
  const collection = getSeriesCollection(seriesId)
  const owned = cards.filter((card) => collection[card.id]).length
  const total = cards.length

  return {
    owned,
    total,
    percent: total ? Math.round((owned / total) * 100) : 0
  }
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

function weightedPick(items, weightKey) {
  const total = items.reduce((sum, item) => sum + item[weightKey], 0)
  let roll = Math.random() * total
  for (const item of items) {
    roll -= item[weightKey]
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

function randomItem(items) {
  if (!items.length) return null
  return items[Math.floor(Math.random() * items.length)]
}

function rollPackSize() {
  return weightedPick(PACK_SIZE_WEIGHTS, 'weight').size
}

function rollRarity() {
  return weightedPick(RARITY_WEIGHTS, 'weight').rarity
}

function pickRandomCard(cards, excludedIds = []) {
  const availableCards = cards.filter((card) => !excludedIds.includes(card.id))
  if (!availableCards.length) return null

  for (let attempt = 0; attempt < RARITY_WEIGHTS.length; attempt += 1) {
    const rarity = rollRarity()
    const rarityCards = availableCards.filter((card) => card.rarity === rarity)
    if (rarityCards.length) return randomItem(rarityCards)
  }

  return randomItem(availableCards)
}

function buildPack(seriesId, collection, options = {}) {
  const cards = getCardsBySeries(seriesId)
  const excludedIds = options.excludedIds || []
  const availableCards = cards.filter((card) => !excludedIds.includes(card.id))
  if (!availableCards.length) return []

  const packSize = rollPackSize()
  const pack = Array.from({ length: packSize }, () => pickRandomCard(cards, excludedIds)).filter(Boolean)
  const missing = availableCards.filter((card) => !collection[card.id])

  if (missing.length) {
    const guaranteed = randomItem(missing)
    if (pack.length) {
      const replaceIndex = Math.floor(Math.random() * pack.length)
      pack[replaceIndex] = guaranteed
    } else {
      pack.push(guaranteed)
    }
  }

  return pack
}

function addPackToCollection(collection, pack) {
  return pack.map((card) => {
    const isNew = !collection[card.id]
    collection[card.id] = (collection[card.id] || 0) + 1
    return {
      ...card,
      isNew
    }
  })
}

function markPackPreview(collection, pack) {
  return addPackToCollection({ ...collection }, pack)
}

function prepareDailyPack(seriesId = getActiveSeriesId()) {
  const collection = getSeriesCollection(seriesId)
  const pack = buildPack(seriesId, collection)
  const previewPack = markPackPreview(collection, pack)

  saveLastPack(previewPack)
  wx.setStorageSync(PACK_GENERATED_DATE_KEY, todayKey())
  return previewPack
}

function claimLastPack(seriesId = getActiveSeriesId()) {
  const pack = getLastPack()
  if (!pack.length) return []

  const collection = getSeriesCollection(seriesId)
  pack.forEach((card) => {
    collection[card.id] = (collection[card.id] || 0) + 1
  })
  saveSeriesCollection(seriesId, collection)
  return pack
}

function rollPack(seriesId = getActiveSeriesId()) {
  const collection = getSeriesCollection(seriesId)
  const pack = buildPack(seriesId, collection)

  const resultPack = addPackToCollection(collection, pack)

  saveSeriesCollection(seriesId, collection)
  saveLastPack(resultPack)
  wx.setStorageSync(PACK_GENERATED_DATE_KEY, todayKey())
  return resultPack
}

function synthesizePack(sourceCardId, seriesId = getActiveSeriesId()) {
  const collection = getSeriesCollection(seriesId)
  const count = collection[sourceCardId] || 0

  if (count < SYNTHESIS_REQUIRED_COUNT) {
    return {
      ok: false,
      message: '数量不足，拥有 4 张同卡才可合成',
      pack: []
    }
  }

  collection[sourceCardId] = count - SYNTHESIS_CONSUME_COUNT

  const pack = buildPack(seriesId, collection, { excludedIds: [sourceCardId] })
  const resultPack = addPackToCollection(collection, pack)
  saveSeriesCollection(seriesId, collection)
  saveLastPack(resultPack)

  return {
    ok: true,
    message: '',
    pack: resultPack
  }
}

function clearTodayPackState() {
  wx.removeStorageSync(PACK_DATE_KEY)
  wx.removeStorageSync(PACK_GENERATED_DATE_KEY)
  wx.removeStorageSync(PACK_KEY)
}

function addDebugTasks() {
  saveTasks([
    {
      id: `debug_task_${Date.now()}_1`,
      name: '数学练习',
      minutes: 20,
      completed: false
    },
    {
      id: `debug_task_${Date.now()}_2`,
      name: '语文阅读',
      minutes: 15,
      completed: false
    }
  ])
  clearTodayPackState()
}

function completeAllTodayTasks() {
  const now = Date.now()
  const tasks = getTasks().map((task) => ({
    ...task,
    completed: true,
    completedAt: task.completedAt || now
  }))
  saveTasks(tasks)
}

function clearTodayTasks() {
  saveTasks([])
  clearTodayPackState()
}

function addDebugDuplicates(seriesId = getActiveSeriesId()) {
  const cards = getCardsBySeries(seriesId)
  if (!cards.length) return null

  const collection = getSeriesCollection(seriesId)
  const card = cards[0]
  collection[card.id] = Math.max(collection[card.id] || 0, 4)
  saveSeriesCollection(seriesId, collection)
  return card
}

function clearActiveSeriesCollection(seriesId = getActiveSeriesId()) {
  saveSeriesCollection(seriesId, {})
  clearTodayPackState()
}

module.exports = {
  getTasks,
  saveTasks,
  getSettings,
  saveSettings,
  getActiveSeriesId,
  setActiveSeriesId,
  hasSelectedSeries,
  getLastSwitchDate,
  getNextSwitchDate,
  getSwitchCooldownInfo,
  getCollection,
  saveCollection,
  getSeriesCollection,
  saveSeriesCollection,
  getLastPack,
  saveLastPack,
  hasOpenedToday,
  markOpenedToday,
  hasGeneratedToday,
  getCollectionProgress,
  chargePercent,
  allCompleted,
  prepareDailyPack,
  claimLastPack,
  rollPack,
  synthesizePack,
  addDebugTasks,
  completeAllTodayTasks,
  clearTodayTasks,
  addDebugDuplicates,
  clearTodayPackState,
  clearActiveSeriesCollection
}
