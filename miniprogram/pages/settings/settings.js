const state = require('../../utils/state')
const { getTheme } = require('../../utils/themes')

Page({
  data: {
    activeTheme: null
  },

  onShow() {
    this.setData({
      activeTheme: getTheme(state.getActiveSeriesId())
    })
  },

  goThemeSelect() {
    wx.navigateTo({ url: '/pages/theme-select/theme-select' })
  }
})
