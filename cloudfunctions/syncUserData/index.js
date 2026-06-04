const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function normalizePayload(payload) {
  const source = ensureObject(payload)
  const data = ensureObject(source.data)

  return {
    schemaVersion: Number(source.schemaVersion || 1),
    generatedAt: String(source.generatedAt || ''),
    generatedDate: String(source.generatedDate || ''),
    data: {
      tasksByDate: ensureObject(data.tasksByDate),
      collection: ensureObject(data.collection),
      packState: ensureObject(data.packState),
      activeSeriesId: String(data.activeSeriesId || ''),
      lastSwitchDate: String(data.lastSwitchDate || ''),
      settings: ensureObject(data.settings),
      childProfile: ensureObject(data.childProfile)
    }
  }
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return {
      ok: false,
      code: 'NO_OPENID',
      message: '无法获取微信用户身份'
    }
  }

  const payload = normalizePayload(event && event.payload)
  const now = db.serverDate()

  await db.collection('users').doc(openid).set({
    data: {
      openid,
      childProfile: payload.data.childProfile,
      activeSeriesId: payload.data.activeSeriesId,
      lastSwitchDate: payload.data.lastSwitchDate,
      settings: payload.data.settings,
      updatedAt: now
    }
  })

  await db.collection('user_sync_snapshots').doc(openid).set({
    data: {
      openid,
      payload,
      updatedAt: now
    }
  })

  return {
    ok: true,
    openid,
    syncedAt: new Date().toISOString()
  }
}
