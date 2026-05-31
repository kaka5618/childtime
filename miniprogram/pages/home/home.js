const state = require('../../utils/state')
const { getTheme } = require('../../utils/themes')

Page({
  data: {
    tasks: [],
    percent: 0,
    allDone: false,
    openedToday: false,
    activeTheme: null
  },

  onShow() {
    if (!state.hasSelectedSeries()) {
      wx.redirectTo({ url: '/pages/theme-select/theme-select' })
      return
    }
    this.refresh()
  },

  refresh() {
    const tasks = state.getTasks()
    const activeTheme = getTheme(state.getActiveSeriesId())
    this.setData({
      tasks,
      percent: state.chargePercent(tasks),
      allDone: state.allCompleted(tasks),
      openedToday: state.hasOpenedToday(),
      activeTheme
    })
  },

  goAddTask() {
    wx.navigateTo({ url: '/pages/task-edit/task-edit' })
  },

  goFocus(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/focus/focus?id=${id}` })
  },

  goEditTask(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/task-edit/task-edit?id=${id}` })
  },

  goPack() {
    wx.navigateTo({ url: '/pages/pack-open/pack-open' })
  },

  goAlbum() {
    wx.navigateTo({ url: '/pages/album/album' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },

  goThemeSelect() {
    wx.navigateTo({ url: '/pages/theme-select/theme-select' })
  }
})
