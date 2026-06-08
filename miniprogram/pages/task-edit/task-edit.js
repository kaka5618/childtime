const state = require('../../utils/state')
const cloudSync = require('../../utils/cloud-sync')

const TASK_TEMPLATES = [
  { key: 'math', name: '数学练习', minutes: 20, activeClass: '' },
  { key: 'reading', name: '语文阅读', minutes: 15, activeClass: '' },
  { key: 'english', name: '英语听读', minutes: 15, activeClass: '' },
  { key: 'review', name: '错题整理', minutes: 20, activeClass: '' },
  { key: 'writing', name: '练字', minutes: 10, activeClass: '' },
  { key: 'preview', name: '课前预习', minutes: 15, activeClass: '' }
]

Page({
  data: {
    taskId: '',
    isEditing: false,
    templateVisible: true,
    selectedTemplateKey: '',
    taskTemplates: TASK_TEMPLATES,
    name: '',
    minutes: 20,
    completed: false,
    saveButtonText: '保存任务'
  },

  onLoad(query) {
    if (!query.id) return

    const task = state.getTasks().find((item) => item.id === query.id)
    if (!task) {
      wx.showToast({ title: '任务不存在', icon: 'none' })
      wx.navigateBack()
      return
    }

    this.setData({
      taskId: task.id,
      isEditing: true,
      templateVisible: false,
      name: task.name,
      minutes: Number(task.minutes),
      completed: Boolean(task.completed),
      saveButtonText: '保存修改'
    })
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value })
  },

  onMinutesInput(event) {
    this.setData({
      minutes: Number(event.detail.value),
      selectedTemplateKey: '',
      taskTemplates: this.buildTemplates('')
    })
  },

  selectTemplate(event) {
    const { key } = event.currentTarget.dataset
    const template = TASK_TEMPLATES.find((item) => item.key === key)
    if (!template) return

    this.setData({
      selectedTemplateKey: key,
      taskTemplates: this.buildTemplates(key),
      name: template.name,
      minutes: template.minutes
    })
  },

  buildTemplates(activeKey) {
    return TASK_TEMPLATES.map((template) => ({
      ...template,
      activeClass: template.key === activeKey ? 'active' : ''
    }))
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
    if (!this.data.isEditing && tasks.length >= 8) {
      wx.showToast({ title: '每天最多 8 项', icon: 'none' })
      return
    }
    if (state.hasOpenedToday()) {
      wx.showToast({ title: '今日已开包，不能修改任务', icon: 'none' })
      return
    }

    if (this.data.isEditing) {
      const nextTasks = tasks.map((task) => {
        if (task.id !== this.data.taskId) return task
        return {
          ...task,
          name,
          minutes
        }
      })
      state.saveTasks(nextTasks)
      cloudSync.scheduleSync()
      wx.navigateBack()
      return
    }

    tasks.push({
      id: `task_${Date.now()}`,
      name,
      minutes,
      completed: false
    })
    state.saveTasks(tasks)
    cloudSync.scheduleSync()
    wx.navigateBack()
  },

  deleteTask() {
    if (state.hasOpenedToday()) {
      wx.showToast({ title: '今日已开包，不能修改任务', icon: 'none' })
      return
    }

    wx.showModal({
      title: '删除任务',
      content: '确定要删除这项任务吗？',
      confirmColor: '#C85A54',
      success: (res) => {
        if (!res.confirm) return
        const nextTasks = state.getTasks().filter((task) => task.id !== this.data.taskId)
        state.saveTasks(nextTasks)
        cloudSync.scheduleSync()
        wx.navigateBack()
      }
    })
  }
})
