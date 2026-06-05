const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

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
    if (error && /does not exist/i.test(String(error.message || error.errMsg || ''))) {
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
