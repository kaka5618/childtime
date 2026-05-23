const state = require('../../utils/state')

Page({
  data: {
    pack: [],
    revealed: false
  },

  onLoad() {
    if (!state.allCompleted(state.getTasks())) {
      wx.showToast({ title: '先完成今日任务', icon: 'none' })
      wx.navigateBack()
      return
    }
    const pack = state.hasGeneratedToday() ? state.getLastPack() : state.rollPack()
    this.setData({ pack })
  },

  reveal() {
    this.setData({ revealed: true })
    state.markOpenedToday()
  },

  goAlbum() {
    wx.redirectTo({ url: '/pages/album/album' })
  }
})
