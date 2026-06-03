const state = require('../../utils/state')
const { getTheme } = require('../../utils/themes')

function getTaskIconPath(name) {
  const text = String(name || '')
  if (text.includes('阅读') || text.includes('语文')) return '/assets/ui/icon-reading.png'
  if (text.includes('英语') || text.toLowerCase().includes('english')) return '/assets/ui/icon-english.png'
  if (text.includes('练字') || text.includes('写') || text.includes('字')) return '/assets/ui/icon-writing.png'
  return '/assets/ui/icon-math.png'
}

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return '早上好'
  if (hour >= 11 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  if (hour >= 18 && hour < 23) return '晚上好'
  return '夜深了'
}

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
    showFocusButton: false,
    focusButtonText: '去专注',
    nextTaskId: '',
    addButtonClass: '',
    greetingText: '你好，小朋友',
    greetingNote: '今天也认真完成计划',
    childName: '',
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
    this.promptForChildName()
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
    const nextTask = rawTasks.find((task) => !task.completed)
    const childName = state.getChildName()
    const displayName = childName || '小朋友'
    const tasks = rawTasks.map((task) => ({
      ...task,
      taskIconPath: getTaskIconPath(task.name),
      taskClass: task.completed ? 'done' : '',
      statusText: task.completed ? `${task.minutes} / ${task.minutes} 分钟` : `0 / ${task.minutes} 分钟`,
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
      showFocusButton: Boolean(nextTask) && !openedToday,
      focusButtonText: nextTask ? '去专注' : '任务完成',
      nextTaskId: nextTask ? nextTask.id : '',
      addButtonClass: openedToday ? 'disabled-btn' : '',
      childName,
      greetingText: `${getTimeGreeting()}，${displayName}`,
      greetingNote: this.getGreetingNote(rawTasks, allDone, openedToday),
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

  promptForChildName() {
    if (state.getChildName()) return

    wx.showModal({
      title: '怎么称呼你？',
      content: '输入孩子的名字，首页会用名字打招呼。',
      editable: true,
      placeholderText: '例如：小星星',
      confirmText: '保存',
      confirmColor: '#7BA68C',
      success: (res) => {
        if (!res.confirm) return
        const childName = state.saveChildName(res.content)
        if (!childName) {
          wx.showToast({ title: '名字不能为空', icon: 'none' })
          this.promptForChildName()
          return
        }
        this.refresh()
      }
    })
  },

  getGreetingNote(tasks, allDone, openedToday) {
    if (openedToday) return '今天的星星已经收好啦'
    if (!tasks.length) return '先添加今天的小任务吧'
    if (allDone) return '任务完成啦，可以开包'
    return '今天也认真完成计划'
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

  goNextTask() {
    if (!this.data.nextTaskId) {
      wx.showToast({ title: '先添加任务', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/focus/focus?id=${this.data.nextTaskId}` })
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
