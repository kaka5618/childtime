const state = require('../../utils/state')
const { getTheme } = require('../../utils/themes')

Page({
  data: {
    tasks: [],
    percent: 0,
    allDone: false,
    openedToday: false,
    activeTheme: null,
    bagClass: '',
    bagTitle: '星梦泡泡能量袋',
    showPackButton: false,
    showAlbumButton: false,
    showThemeChip: false,
    emptyVisible: false,
    addButtonClass: '',
    energyProgressText: '0 / 0 分钟',
    todaySummary: {
      completedTasks: 0,
      totalTasks: 0,
      completedMinutes: 0,
      totalMinutes: 0,
      packText: '未获得'
    },
    nextActionText: ''
  },

  onShow() {
    if (!state.hasSelectedSeries()) {
      wx.redirectTo({ url: '/pages/theme-select/theme-select' })
      return
    }
    this.refresh()
  },

  refresh() {
    const rawTasks = state.getTasks()
    const seriesId = state.getActiveSeriesId()
    const activeTheme = getTheme(seriesId)
    const collectionProgress = state.getCollectionProgress(seriesId)
    const completedTasks = rawTasks.filter((task) => task.completed).length
    const totalMinutes = rawTasks.reduce((sum, task) => sum + Number(task.minutes || 0), 0)
    const completedMinutes = rawTasks
      .filter((task) => task.completed)
      .reduce((sum, task) => sum + Number(task.minutes || 0), 0)
    const openedToday = state.hasOpenedToday()
    const allDone = state.allCompleted(rawTasks)
    const percent = state.chargePercent(rawTasks)
    const tasks = rawTasks.map((task) => ({
      ...task,
      taskIcon: task.completed ? '✓' : '✦',
      taskClass: task.completed ? 'done' : '',
      statusText: task.completed ? '已完成' : '开始',
      editButtonClass: openedToday ? 'disabled-edit' : ''
    }))
    this.setData({
      tasks,
      percent,
      allDone,
      openedToday,
      activeTheme,
      collectionProgress,
      bagClass: percent === 100 ? 'full' : '',
      bagTitle: allDone ? '能量满了' : '星梦泡泡能量袋',
      showPackButton: allDone && !openedToday,
      showAlbumButton: openedToday,
      showThemeChip: Boolean(activeTheme),
      emptyVisible: tasks.length === 0,
      addButtonClass: openedToday ? 'disabled-btn' : '',
      todaySummary: {
        completedTasks,
        totalTasks: rawTasks.length,
        completedMinutes,
        totalMinutes,
        packText: openedToday ? '已获得' : '未获得'
      },
      energyProgressText: `${completedMinutes} / ${totalMinutes} 分钟`,
      nextActionText: this.getNextActionText(rawTasks, allDone, openedToday)
    })
  },

  getNextActionText(tasks, allDone, openedToday) {
    if (!tasks.length) return '先添加今晚任务'
    if (openedToday) return '明天再来开新包'
    if (allDone) return '可以开包了'
    return '继续完成任务'
  },

  goAddTask() {
    if (this.data.openedToday) {
      wx.showToast({ title: '今日已开包，不能修改任务', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/task-edit/task-edit' })
  },

  goFocus(event) {
    if (this.data.openedToday) {
      wx.showToast({ title: '今日已开包，明天再继续', icon: 'none' })
      return
    }
    const { id } = event.currentTarget.dataset
    const task = this.data.tasks.find((item) => item.id === id)
    if (task && task.completed) {
      wx.showToast({ title: '这项已经完成', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/focus/focus?id=${id}` })
  },

  goEditTask(event) {
    if (this.data.openedToday) {
      wx.showToast({ title: '今日已开包，不能修改任务', icon: 'none' })
      return
    }
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
