function getCloudConfig() {
  const app = typeof getApp === 'function' ? getApp() : null
  const globalData = app && app.globalData ? app.globalData : {}
  return {
    enabled: Boolean(globalData.cloudSyncEnabled),
    baseFileID: String(globalData.cloudAssetBaseFileID || '').replace(/\/$/, ''),
    fileIDs: globalData.cloudAssetFileIDs || {}
  }
}

function buildCloudFileID(card, config) {
  if (!card || !card.id) return ''
  const seriesId = card.seriesId || 'star_dream_bubble'
  const directFileID = config.fileIDs[card.id] || config.fileIDs[`${seriesId}/${card.id}`]
  if (directFileID) return directFileID
  if (!config.baseFileID) return ''
  return `${config.baseFileID}/cards/${seriesId}/${card.id}.jpg`
}

function buildCloudAssetFileID(path, config) {
  if (!path || !config.enabled || !config.baseFileID) return ''
  return `${config.baseFileID}/${String(path).replace(/^\/+/, '')}`
}

function attachLocalCloudFileIDs(cards) {
  const config = getCloudConfig()
  if (!config.enabled) {
    return cards.map((card) => ({
      ...card,
      imageUrl: card.image,
      cloudFileID: ''
    }))
  }

  return cards.map((card) => {
    const cloudFileID = buildCloudFileID(card, config)
    return {
      ...card,
      imageUrl: cloudFileID || card.image,
      cloudFileID
    }
  })
}

function resolveCards(cards) {
  return Promise.resolve(attachLocalCloudFileIDs(cards))
}

function resolveCard(card) {
  if (!card) return Promise.resolve(card)
  return resolveCards([card]).then((cards) => cards[0])
}

function resolveAsset(path, fallbackPath) {
  return Promise.resolve(fallbackPath || '')
}

module.exports = {
  resolveCard,
  resolveCards,
  resolveAsset
}
