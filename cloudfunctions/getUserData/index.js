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

function isDocumentMissing(error) {
  const text = getErrorText(error)
  return /does not exist|document not exists|DOCUMENT_NOT_EXIST/i.test(text)
}

exports.main = async () => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return {
      ok: false,
      code: 'NO_OPENID',
      message: '无法获取微信用户身份'
    }
  }

  try {
    const snapshot = await db.collection('user_sync_snapshots').doc(openid).get()
    const data = snapshot.data || {}

    if (!data.payload) {
      return {
        ok: false,
        code: 'NO_SNAPSHOT',
        message: '云端还没有同步数据'
      }
    }

    return {
      ok: true,
      openid,
      payload: data.payload,
      updatedAt: data.updatedAt || ''
    }
  } catch (error) {
    if (isCollectionMissing(error) || isDocumentMissing(error)) {
      return {
        ok: false,
        code: 'NO_SNAPSHOT',
        message: '云端还没有同步数据'
      }
    }

    return {
      ok: false,
      code: 'READ_FAILED',
      message: error && error.message ? error.message : '读取云端数据失败'
    }
  }
}
