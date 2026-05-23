const state = require('../../utils/state')

Page({
  data: {
    name: '',
    minutes: 20
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value })
  },

  onMinutesInput(event) {
    this.setData({ minutes: Number(event.detail.value) })
  },

  saveTask() {
    const name = this.data.name.trim()
    const minutes = Number(this.data.minutes)
    const tasks = state.getTasks()

    if (!name) {
      wx.showToast({ title: '请输入任务名', icon: 'none' })
      return
    }
    if (name.length > 20) {
      wx.showToast({ title: '任务名最多 20 字', icon: 'none' })
      return
    }
    if (minutes < 5 || minutes > 90) {
      wx.showToast({ title: '时间为 5-90 分钟', icon: 'none' })
      return
    }
    if (tasks.length >= 8) {
      wx.showToast({ title: '每天最多 8 项', icon: 'none' })
      return
    }
    if (state.hasOpenedToday()) {
      wx.showToast({ title: '今日已开包，不能修改任务', icon: 'none' })
      return
    }

    tasks.push({
      id: `task_${Date.now()}`,
      name,
      minutes,
      completed: false
    })
    state.saveTasks(tasks)
    wx.navigateBack()
  }
})
