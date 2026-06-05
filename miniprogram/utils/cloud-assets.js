const tempUrlCache = {}

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

function getTempFileURLs(fileIDs) {
  if (!fileIDs.length || !wx.cloud || !wx.cloud.getTempFileURL) {
    return Promise.resolve({})
  }

  const pendingFileIDs = fileIDs.filter((fileID) => !tempUrlCache[fileID])
  if (!pendingFileIDs.length) {
    return Promise.resolve(tempUrlCache)
  }

  return new Promise((resolve) => {
    wx.cloud.getTempFileURL({
      fileList: pendingFileIDs,
      success: (res) => {
        ;(res.fileList || []).forEach((item) => {
          if (item.status === 0 && item.tempFileURL) {
            tempUrlCache[item.fileID] = item.tempFileURL
          }
        })
        resolve(tempUrlCache)
      },
      fail: () => {
        resolve(tempUrlCache)
      }
    })
  })
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
      imageUrl: cloudFileID && tempUrlCache[cloudFileID] ? tempUrlCache[cloudFileID] : card.image,
      cloudFileID
    }
  })
}

function resolveCards(cards) {
  const localCards = attachLocalCloudFileIDs(cards)
  const fileIDs = Array.from(new Set(localCards.map((card) => card.cloudFileID).filter(Boolean)))

  return getTempFileURLs(fileIDs).then((urlMap) => {
    return localCards.map((card) => ({
      ...card,
      imageUrl: card.cloudFileID && urlMap[card.cloudFileID] ? urlMap[card.cloudFileID] : card.image
    }))
  })
}

function resolveCard(card) {
  if (!card) return Promise.resolve(card)
  return resolveCards([card]).then((cards) => cards[0])
}

function resolveAsset(path, fallbackPath) {
  const config = getCloudConfig()
  const cloudFileID = buildCloudAssetFileID(path, config)
  if (!cloudFileID) return Promise.resolve(fallbackPath || '')

  return getTempFileURLs([cloudFileID]).then((urlMap) => {
    return urlMap[cloudFileID] || fallbackPath || ''
  })
}

module.exports = {
  resolveCard,
  resolveCards,
  resolveAsset
}
