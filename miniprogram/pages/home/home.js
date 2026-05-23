const state = require('../../utils/state')

Page({
  data: {
    tasks: [],
    percent: 0,
    allDone: false,
    openedToday: false
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const tasks = state.getTasks()
    this.setData({
      tasks,
      percent: state.chargePercent(tasks),
      allDone: state.allCompleted(tasks),
      openedToday: state.hasOpenedToday()
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
  }
})
