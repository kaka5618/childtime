const state = require('../../utils/state')

Page({
  data: {
    task: null,
    secondsLeft: 0,
    timeText: '00:00'
  },

  timer: null,

  onLoad(query) {
    const task = state.getTasks().find((item) => item.id === query.id)
    if (!task) {
      wx.showToast({ title: '任务不存在', icon: 'none' })
      wx.navigateBack()
      return
    }
    const secondsLeft = Math.max(1, Number(task.minutes) * 60)
    this.setData({
      task,
      secondsLeft,
      timeText: this.formatTime(secondsLeft)
    })
    this.startTimer()
  },

  onUnload() {
    this.stopTimer()
  },

  startTimer() {
    this.stopTimer()
    this.timer = setInterval(() => {
      const next = Math.max(0, this.data.secondsLeft - 1)
      this.setData({
        secondsLeft: next,
        timeText: this.formatTime(next)
      })
      if (next === 0) this.stopTimer()
    }, 1000)
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  },

  completeTask() {
    const tasks = state.getTasks().map((item) => {
      if (item.id !== this.data.task.id) return item
      return {
        ...item,
        completed: true,
        completedAt: Date.now()
      }
    })
    state.saveTasks(tasks)
    wx.showToast({ title: '已完成', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 450)
  }
})
