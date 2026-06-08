const state = require('./state')

let syncTimer = null
let syncInFlight = false
let syncQueued = false

function isCloudConfigured() {
  const app = getApp()
  return Boolean(
    app.globalData &&
    app.globalData.cloudSyncEnabled &&
    wx.cloud &&
    wx.cloud.callFunction
  )
}

function canSync() {
  const accountStatus = state.getAccountStatus()
  return Boolean(accountStatus.loginReady && isCloudConfigured())
}

function canAutoSync() {
  const app = getApp()
  return Boolean(app.globalData && app.globalData.cloudAutoSyncEnabled && canSync())
}

function formatSyncError(error, fallbackText) {
  const message = String(
    (error && (error.errMsg || error.message)) || fallbackText || '自动同步失败'
  )
  if (/FUNCTION_NOT_FOUND|FunctionName parameter could not be found/i.test(message)) {
    return '云函数还没有部署'
  }
  if (/collection not exists|Db or Table not exist|DATABASE_COLLECTION_NOT_EXIST|-502005/i.test(message)) {
    return '云数据库集合还没创建'
  }
  if (/timeout/i.test(message)) {
    return '云端响应超时'
  }
  return message.length > 42 ? `${message.slice(0, 42)}...` : message
}

function syncNow() {
  if (!canSync()) {
    return Promise.resolve({ ok: false, skipped: true })
  }

  if (syncInFlight) {
    syncQueued = true
    return Promise.resolve({ ok: false, queued: true })
  }

  syncInFlight = true
  const app = getApp()

  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: app.globalData.cloudSyncFunction || 'syncUserData',
      data: {
        payload: state.buildCloudSyncPayload()
      },
      success: (res) => {
        if (res.result && res.result.ok) {
          state.saveCloudSyncStatus({
            cloudLinked: true,
            lastResult: 'success',
            lastSyncAt: new Date().toISOString(),
            lastError: ''
          })
          resolve({ ok: true })
          return
        }

        const message = res.result && res.result.message ? res.result.message : '云函数返回异常'
        state.saveCloudSyncStatus({
          cloudLinked: false,
          lastResult: 'failed',
          lastError: formatSyncError(null, message)
        })
        resolve({ ok: false, message })
      },
      fail: (error) => {
        const message = formatSyncError(error, '自动同步失败')
        state.saveCloudSyncStatus({
          cloudLinked: false,
          lastResult: 'failed',
          lastError: message
        })
        resolve({ ok: false, message })
      },
      complete: () => {
        syncInFlight = false
        if (syncQueued) {
          syncQueued = false
          scheduleSync(500)
        }
      }
    })
  })
}

function scheduleSync(delay = 800) {
  if (!canAutoSync()) {
    return
  }

  if (syncTimer) {
    clearTimeout(syncTimer)
  }

  syncTimer = setTimeout(() => {
    syncTimer = null
    syncNow()
  }, delay)
}

module.exports = {
  canSync,
  canAutoSync,
  syncNow,
  scheduleSync
}
