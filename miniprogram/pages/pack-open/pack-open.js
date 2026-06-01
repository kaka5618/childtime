const state = require('../../utils/state')
const { getTheme, getActiveTheme } = require('../../utils/themes')

function getCurrentTheme() {
  return getTheme(state.getActiveSeriesId()) || getActiveTheme()
}

Page({
  data: {
    pack: [],
    newCount: 0,
    revealed: false,
    claimed: false,
    opening: false,
    source: 'daily',
    activeTheme: null,
    openingClass: '',
    packTitle: '',
    packHint: '',
    packMark: '?',
    openButtonText: '打开卡包'
  },

  openTimer: null,

  onLoad(query) {
    const source = query.source || 'daily'
    const activeTheme = getCurrentTheme()

    if (source === 'synthesis') {
      const pack = state.getLastPack()
      if (!pack.length) {
        wx.showToast({ title: '没有可展示的卡包', icon: 'none' })
        wx.navigateBack()
        return
      }
      this.setPackData(pack, source, activeTheme)
      return
    }

    if (!state.allCompleted(state.getTasks())) {
      wx.showToast({ title: '先完成今日任务', icon: 'none' })
      wx.navigateBack()
      return
    }
    const pack = state.hasGeneratedToday() ? state.getLastPack() : state.prepareDailyPack()
    this.setPackData(pack, source, activeTheme)
  },

  onUnload() {
    if (this.openTimer) {
      clearTimeout(this.openTimer)
      this.openTimer = null
    }
  },

  beginOpen() {
    if (this.data.opening) return

    this.setData({
      opening: true,
      openingClass: 'opening',
      openButtonText: '打开中'
    })
    this.openTimer = setTimeout(() => {
      this.reveal()
    }, 900)
  },

  setPackData(pack, source, activeTheme) {
    this.setData({
      pack,
      source,
      activeTheme,
      packTitle: source === 'synthesis' ? '合成卡包' : activeTheme.packTitle,
      packHint: source === 'synthesis' ? '重复卡变成了新的惊喜。' : activeTheme.packHint,
      packMark: activeTheme.shortName || '?',
      newCount: pack.filter((card) => card.isNew).length
    })
  },

  reveal() {
    if (this.data.source === 'daily' && !this.data.claimed && !state.hasOpenedToday()) {
      state.claimLastPack()
      state.markOpenedToday()
    }
    this.setData({
      revealed: true,
      opening: false,
      claimed: true,
      openingClass: '',
      openButtonText: '打开卡包'
    })
  },

  goAlbum() {
    wx.redirectTo({ url: '/pages/album/album' })
  }
})
