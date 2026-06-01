const state = require('../../utils/state')
const { getTheme } = require('../../utils/themes')

Page({
  data: {
    activeTheme: null,
    activeThemeName: '未选择',
    nextSwitchDate: '',
    voiceEnabled: true,
    voiceType: 'gentle',
    volume: 60,
    voiceOptionsClass: '',
    voiceTypes: [
      { key: 'gentle', label: '温柔', activeClass: 'active' },
      { key: 'bright', label: '清亮', activeClass: '' }
    ]
  },

  onShow() {
    this.refreshSettings()
  },

  refreshSettings() {
    try {
      const settings = state.getSettings()
      const activeTheme = getTheme(state.getActiveSeriesId())
      this.setData({
        activeTheme,
        activeThemeName: activeTheme ? activeTheme.name : '未选择',
        nextSwitchDate: state.getNextSwitchDate(),
        voiceEnabled: settings.voiceEnabled,
        voiceType: settings.voiceType,
        volume: settings.volume,
        voiceOptionsClass: settings.voiceEnabled ? '' : 'disabled',
        voiceTypes: this.buildVoiceTypes(settings.voiceType)
      })
    } catch (error) {
      this.setData({
        activeTheme: null,
        activeThemeName: '未选择',
        nextSwitchDate: '',
        voiceEnabled: true,
        voiceType: 'gentle',
        volume: 60,
        voiceOptionsClass: '',
        voiceTypes: this.buildVoiceTypes('gentle')
      })
      wx.showToast({ title: '设置加载失败', icon: 'none' })
    }
  },

  buildVoiceTypes(activeType) {
    return [
      { key: 'gentle', label: '温柔', activeClass: activeType === 'gentle' ? 'active' : '' },
      { key: 'bright', label: '清亮', activeClass: activeType === 'bright' ? 'active' : '' }
    ]
  },

  goThemeSelect() {
    wx.navigateTo({ url: '/pages/theme-select/theme-select' })
  },

  toggleVoice(event) {
    const voiceEnabled = event.detail.value
    state.saveSettings({ voiceEnabled })
    this.setData({
      voiceEnabled,
      voiceOptionsClass: voiceEnabled ? '' : 'disabled'
    })
  },

  changeVoiceType(event) {
    const { type } = event.currentTarget.dataset
    state.saveSettings({ voiceType: type })
    this.setData({
      voiceType: type,
      voiceTypes: this.buildVoiceTypes(type)
    })
  },

  changeVolume(event) {
    const volume = Number(event.detail.value)
    state.saveSettings({ volume })
    this.setData({ volume })
  },

  addDebugTasks() {
    state.addDebugTasks()
    wx.showToast({ title: '已添加测试任务', icon: 'success' })
  },

  completeDebugTasks() {
    state.completeAllTodayTasks()
    wx.showToast({ title: '已完成今日任务', icon: 'success' })
  },

  clearDebugTasks() {
    wx.showModal({
      title: '清空今日任务',
      content: '会清空今日任务和今日开包状态。',
      confirmColor: '#C85A54',
      success: (res) => {
        if (!res.confirm) return
        state.clearTodayTasks()
        wx.showToast({ title: '已清空', icon: 'success' })
      }
    })
  },

  addDebugDuplicates() {
    const card = state.addDebugDuplicates()
    wx.showToast({ title: card ? '已添加重复卡' : '没有卡池', icon: 'none' })
  },

  resetDebugPack() {
    state.clearTodayPackState()
    wx.showToast({ title: '已重置开包', icon: 'success' })
  },

  clearDebugCollection() {
    wx.showModal({
      title: '清空收藏',
      content: '会清空当前主题收藏和今日开包状态。',
      confirmColor: '#C85A54',
      success: (res) => {
        if (!res.confirm) return
        state.clearActiveSeriesCollection()
        wx.showToast({ title: '已清空收藏', icon: 'success' })
      }
    })
  }
})
