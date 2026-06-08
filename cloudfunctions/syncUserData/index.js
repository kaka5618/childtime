const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

function getErrorText(error) {
  return String(
    (error && (error.errMsg || error.message || error.code || error.errCode)) || ''
  )
}

function isCollectionMissing(error) {
  const text = getErrorText(error)
  return /collection not exists|Db or Table not exist|DATABASE_COLLECTION_NOT_EXIST|ResourceNotFound|-502005/i.test(text)
}

function isCollectionAlreadyExists(error) {
  const text = getErrorText(error)
  return /already exists|already exist|collection exists|DATABASE_COLLECTION_ALREADY_EXIST/i.test(text)
}

async function ensureCollection(collectionName) {
  try {
    await db.createCollection(collectionName)
  } catch (error) {
    if (isCollectionAlreadyExists(error)) {
      return
    }
    throw error
  }
}

async function setDocument(collectionName, docId, data) {
  try {
    return await db.collection(collectionName).doc(docId).set({ data })
  } catch (error) {
    if (!isCollectionMissing(error)) {
      throw error
    }

    await ensureCollection(collectionName)
    return db.collection(collectionName).doc(docId).set({ data })
  }
}

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

  await setDocument('users', openid, {
    openid,
    childProfile: payload.data.childProfile,
    activeSeriesId: payload.data.activeSeriesId,
    lastSwitchDate: payload.data.lastSwitchDate,
    settings: payload.data.settings,
    updatedAt: now
  })

  await setDocument('user_sync_snapshots', openid, {
    openid,
    payload,
    updatedAt: now
  })

  return {
    ok: true,
    openid,
    syncedAt: new Date().toISOString()
  }
}
