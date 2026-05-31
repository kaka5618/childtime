const state = require('../../utils/state')

Page({
  data: {
    pack: [],
    revealed: false,
    opening: false,
    source: 'daily'
  },

  openTimer: null,

  onLoad(query) {
    const source = query.source || 'daily'

    if (source === 'synthesis') {
      const pack = state.getLastPack()
      if (!pack.length) {
        wx.showToast({ title: '没有可展示的卡包', icon: 'none' })
        wx.navigateBack()
        return
      }
      this.setData({ pack, source })
      return
    }

    if (!state.allCompleted(state.getTasks())) {
      wx.showToast({ title: '先完成今日任务', icon: 'none' })
      wx.navigateBack()
      return
    }
    const pack = state.hasGeneratedToday() ? state.getLastPack() : state.rollPack()
    this.setData({ pack, source })
  },

  onUnload() {
    if (this.openTimer) {
      clearTimeout(this.openTimer)
      this.openTimer = null
    }
  },

  beginOpen() {
    if (this.data.opening) return

    this.setData({ opening: true })
    this.openTimer = setTimeout(() => {
      this.reveal()
    }, 900)
  },

  reveal() {
    this.setData({
      revealed: true,
      opening: false
    })
    if (this.data.source === 'daily') {
      state.markOpenedToday()
    }
  },

  goAlbum() {
    wx.redirectTo({ url: '/pages/album/album' })
  }
})
