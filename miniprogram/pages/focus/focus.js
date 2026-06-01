const state = require('../../utils/state')
const audio = require('../../utils/audio')

Page({
  data: {
    task: null,
    secondsLeft: 0,
    timeText: '00:00',
    completed: false,
    completedCardClass: '',
    rewardVisible: false,
    rewardTitle: '',
    rewardText: '',
    canOpenPack: false,
    timerHint: '请专注到倒计时结束。',
    completeButtonText: '长按完成'
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
    audio.playVoice('taskStart')
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
        timeText: this.formatTime(next),
        timerHint: next === 0 ? '时间到了，可以整理一下再完成。' : '请专注到倒计时结束。',
        completeButtonText: next === 0 ? '长按确认完成' : '长按完成'
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
    if (this.data.secondsLeft > 0) {
      wx.showModal({
        title: '还没到时间',
        content: '确认已经完成这项学习了吗？',
        confirmText: '确认完成',
        confirmColor: '#7BA68C',
        success: (res) => {
          if (res.confirm) this.finishTask()
        }
      })
      return
    }

    this.finishTask()
  },

  finishTask() {
    if (this.data.completed) return
    const tasks = state.getTasks().map((item) => {
      if (item.id !== this.data.task.id) return item
      return {
        ...item,
        completed: true,
        completedAt: Date.now()
      }
    })
    state.saveTasks(tasks)
    this.stopTimer()

    const allDone = state.allCompleted(tasks)
    audio.playVoice(allDone ? 'allComplete' : 'taskComplete')
    this.setData({
      completed: true,
      completedCardClass: 'completed-card',
      rewardVisible: true,
      rewardTitle: allDone ? '能量装满啦' : '完成一项',
      rewardText: allDone ? '今天的任务都完成了，可以开启卡包。' : '能量又涨了一截，继续完成下一项。',
      canOpenPack: allDone && !state.hasOpenedToday(),
      timerHint: '已完成'
    })
  },

  goHome() {
    wx.navigateBack()
  },

  goPack() {
    wx.redirectTo({ url: '/pages/pack-open/pack-open' })
  }
})
