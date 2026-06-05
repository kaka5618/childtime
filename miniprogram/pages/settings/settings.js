const state = require('../../utils/state')
const { getTheme } = require('../../utils/themes')

Page({
  data: {
    activeTheme: null,
    activeThemeName: '未选择',
    childName: '小朋友',
    avatarEmoji: '⭐',
    gradeLabel: '小学低年级',
    dailyTargetMinutes: 45,
    avatarOptions: [],
    gradeOptions: [],
    nameEditorVisible: false,
    nameDraft: '',
    nextSwitchDate: '',
    voiceEnabled: true,
    voiceType: 'gentle',
    volume: 60,
    voiceOptionsClass: '',
    accountSummary: '未连接微信账号',
    accountBadgeText: '本机数据',
    accountConnected: false,
    syncSummary: '还没有同步记录',
    syncButtonText: '同步云端',
    restoreCloudButtonText: '云端恢复',
    syncBusy: false,
    backupExists: false,
    backupSummary: '还没有本地备份',
    debugVisible: false,
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
      const profile = state.getChildProfile()
      const childName = profile.name || '小朋友'
      const backupInfo = state.getLocalBackupInfo()
      const accountStatus = state.getAccountStatus()
      const syncStatus = state.getCloudSyncStatus()
      this.setData({
        activeTheme,
        activeThemeName: activeTheme ? activeTheme.name : '未选择',
        childName,
        avatarEmoji: profile.avatarEmoji,
        gradeLabel: profile.gradeLabel,
        dailyTargetMinutes: profile.dailyTargetMinutes,
        avatarOptions: this.buildAvatarOptions(profile.avatarKey),
        gradeOptions: this.buildGradeOptions(profile.gradeKey),
        nextSwitchDate: state.getNextSwitchDate(),
        voiceEnabled: settings.voiceEnabled,
        voiceType: settings.voiceType,
        volume: settings.volume,
        voiceOptionsClass: settings.voiceEnabled ? '' : 'disabled',
        voiceTypes: this.buildVoiceTypes(settings.voiceType),
        accountSummary: this.buildAccountSummary(accountStatus),
        accountBadgeText: this.buildAccountBadgeText(accountStatus),
        accountConnected: accountStatus.loginReady,
        syncSummary: this.buildSyncSummary(syncStatus),
        syncButtonText: '同步云端',
        restoreCloudButtonText: '云端恢复',
        syncBusy: false,
        backupExists: backupInfo.exists,
        backupSummary: this.buildBackupSummary(backupInfo)
      })
    } catch (error) {
      this.setData({
        activeTheme: null,
        activeThemeName: '未选择',
        childName: '小朋友',
        avatarEmoji: '⭐',
        gradeLabel: '小学低年级',
        dailyTargetMinutes: 45,
        avatarOptions: this.buildAvatarOptions('star'),
        gradeOptions: this.buildGradeOptions('lower'),
        nameEditorVisible: false,
        nameDraft: '',
        nextSwitchDate: '',
        voiceEnabled: true,
        voiceType: 'gentle',
        volume: 60,
        voiceOptionsClass: '',
        voiceTypes: this.buildVoiceTypes('gentle'),
        accountSummary: '未连接微信账号',
        accountBadgeText: '本机数据',
        accountConnected: false,
        syncSummary: '还没有同步记录',
        syncButtonText: '同步云端',
        restoreCloudButtonText: '云端恢复',
        syncBusy: false,
        backupExists: false,
        backupSummary: '还没有本地备份'
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

  buildAvatarOptions(activeKey) {
    return [
      { key: 'star', emoji: '⭐', label: '星星', activeClass: activeKey === 'star' ? 'active' : '' },
      { key: 'bear', emoji: '🧸', label: '小熊', activeClass: activeKey === 'bear' ? 'active' : '' },
      { key: 'flower', emoji: '🌸', label: '小花', activeClass: activeKey === 'flower' ? 'active' : '' },
      { key: 'rocket', emoji: '🚀', label: '火箭', activeClass: activeKey === 'rocket' ? 'active' : '' }
    ]
  },

  buildGradeOptions(activeKey) {
    return [
      { key: 'preschool', label: '幼儿园', activeClass: activeKey === 'preschool' ? 'active' : '' },
      { key: 'lower', label: '小学低年级', activeClass: activeKey === 'lower' ? 'active' : '' },
      { key: 'middle', label: '小学中年级', activeClass: activeKey === 'middle' ? 'active' : '' },
      { key: 'upper', label: '小学高年级', activeClass: activeKey === 'upper' ? 'active' : '' }
    ]
  },

  buildBackupSummary(info) {
    if (!info.exists) return '还没有本地备份'
    return `备份日期 ${info.createdDate} · 任务 ${info.taskDayCount} 天 · 收藏 ${info.collectionSeriesCount} 套`
  },

  buildAccountSummary(accountStatus) {
    if (!accountStatus.loginReady) return '当前数据只保存在本机。'
    if (accountStatus.cloudLinked) return '已连接微信账号并开启云端同步。'
    return '已完成微信登录准备，等待接入云端同步。'
  },

  buildAccountBadgeText(accountStatus) {
    if (accountStatus.cloudLinked) return '已同步'
    if (accountStatus.loginReady) return '待接入云端'
    return '本机数据'
  },

  buildSyncSummary(syncStatus) {
    if (!syncStatus || syncStatus.lastResult === 'idle') return '还没有同步记录'
    if (syncStatus.lastResult === 'success') return `上次同步成功 ${this.formatTimeText(syncStatus.lastSyncAt)}`
    if (syncStatus.lastResult === 'unconfigured') return '云端还未配置，本机数据没有上传。'
    return syncStatus.lastError ? `同步失败：${syncStatus.lastError}` : '同步失败，请稍后重试。'
  },

  formatTimeText(value) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hour}:${minute}`
  },

  goThemeSelect() {
    wx.navigateTo({ url: '/pages/theme-select/theme-select' })
  },

  editChildName() {
    this.setData({
      nameEditorVisible: true,
      nameDraft: this.data.childName === '小朋友' ? '' : this.data.childName
    })
  },

  closeNameEditor() {
    this.setData({
      nameEditorVisible: false,
      nameDraft: ''
    })
  },

  onNameDraftInput(event) {
    this.setData({ nameDraft: event.detail.value })
  },

  saveNameEditor() {
    const profile = state.saveChildProfile({ name: this.data.nameDraft })
    if (!profile.name) {
      wx.showToast({ title: '请输入名字', icon: 'none' })
      return
    }
    this.setData({
      childName: profile.name,
      nameEditorVisible: false,
      nameDraft: ''
    })
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  selectAvatar(event) {
    const { key, emoji } = event.currentTarget.dataset
    const profile = state.saveChildProfile({ avatarKey: key, avatarEmoji: emoji })
    this.setData({
      avatarEmoji: profile.avatarEmoji,
      avatarOptions: this.buildAvatarOptions(profile.avatarKey)
    })
  },

  selectGrade(event) {
    const { key, label } = event.currentTarget.dataset
    const profile = state.saveChildProfile({ gradeKey: key, gradeLabel: label })
    this.setData({
      gradeLabel: profile.gradeLabel,
      gradeOptions: this.buildGradeOptions(profile.gradeKey)
    })
  },

  changeDailyTarget(event) {
    const profile = state.saveChildProfile({ dailyTargetMinutes: Number(event.detail.value) })
    this.setData({ dailyTargetMinutes: profile.dailyTargetMinutes })
  },

  connectWechatAccount() {
    wx.login({
      success: (res) => {
        if (!res.code) {
          wx.showToast({ title: '微信登录失败', icon: 'none' })
          return
        }
        const accountStatus = state.saveWechatLoginReady()
        this.setData({
          accountSummary: this.buildAccountSummary(accountStatus),
          accountBadgeText: this.buildAccountBadgeText(accountStatus),
          accountConnected: true
        })
        wx.showToast({ title: '已准备登录', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '微信登录失败', icon: 'none' })
      }
    })
  },

  disconnectWechatAccount() {
    wx.showModal({
      title: '解除微信状态',
      content: '只清除本机上的微信登录准备状态，不会删除孩子档案、任务或收藏。',
      confirmText: '解除',
      confirmColor: '#C85A54',
      success: (res) => {
        if (!res.confirm) return
        state.clearAccountStatus()
        const syncStatus = state.saveCloudSyncStatus({
          cloudLinked: false,
          lastResult: 'idle',
          lastSyncAt: '',
          lastError: ''
        })
        this.setData({
          accountSummary: '当前数据只保存在本机。',
          accountBadgeText: '本机数据',
          accountConnected: false,
          syncSummary: this.buildSyncSummary(syncStatus)
        })
        wx.showToast({ title: '已解除', icon: 'success' })
      }
    })
  },

  syncCloudData() {
    if (this.data.syncBusy) return

    const accountStatus = state.getAccountStatus()
    if (!accountStatus.loginReady) {
      wx.showToast({ title: '先完成微信登录', icon: 'none' })
      return
    }

    if (!this.isCloudSyncConfigured()) {
      const syncStatus = state.saveCloudSyncStatus({
        cloudLinked: false,
        lastResult: 'unconfigured',
        lastSyncAt: '',
        lastError: '未配置云开发'
      })
      this.setData({
        accountSummary: this.buildAccountSummary(state.getAccountStatus()),
        accountBadgeText: this.buildAccountBadgeText(state.getAccountStatus()),
        syncSummary: this.buildSyncSummary(syncStatus)
      })
      wx.showModal({
        title: '云端未配置',
        content: '需要先接入云开发，并创建 syncUserData 云函数。当前本机数据不会上传。',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    this.setData({
      syncBusy: true,
      syncButtonText: '同步中'
    })
    wx.showLoading({ title: '同步中' })

    const app = getApp()
    wx.cloud.callFunction({
      name: app.globalData.cloudSyncFunction || 'syncUserData',
      data: {
        payload: state.buildCloudSyncPayload()
      },
      success: (res) => {
        if (!res.result || !res.result.ok) {
          const errorMessage = res.result && res.result.message ? res.result.message : '云函数返回异常'
          const syncStatus = state.saveCloudSyncStatus({
            cloudLinked: false,
            lastResult: 'failed',
            lastError: errorMessage
          })
          const nextAccountStatus = state.getAccountStatus()
          this.setData({
            accountSummary: this.buildAccountSummary(nextAccountStatus),
            accountBadgeText: this.buildAccountBadgeText(nextAccountStatus),
            syncSummary: this.buildSyncSummary(syncStatus)
          })
          wx.showToast({ title: '同步失败', icon: 'none' })
          return
        }

        const syncStatus = state.saveCloudSyncStatus({
          cloudLinked: true,
          lastResult: 'success',
          lastSyncAt: new Date().toISOString(),
          lastError: ''
        })
        const nextAccountStatus = state.getAccountStatus()
        this.setData({
          accountSummary: this.buildAccountSummary(nextAccountStatus),
          accountBadgeText: this.buildAccountBadgeText(nextAccountStatus),
          syncSummary: this.buildSyncSummary(syncStatus)
        })
        wx.showToast({ title: '已同步', icon: 'success' })
      },
      fail: (error) => {
        const syncStatus = state.saveCloudSyncStatus({
          cloudLinked: false,
          lastResult: 'failed',
          lastError: error && error.errMsg ? error.errMsg : '云函数调用失败'
        })
        const nextAccountStatus = state.getAccountStatus()
        this.setData({
          accountSummary: this.buildAccountSummary(nextAccountStatus),
          accountBadgeText: this.buildAccountBadgeText(nextAccountStatus),
          syncSummary: this.buildSyncSummary(syncStatus)
        })
        wx.showToast({ title: '同步失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
        this.setData({
          syncBusy: false,
          syncButtonText: '同步云端'
        })
      }
    })
  },

  restoreCloudData() {
    if (this.data.syncBusy) return

    const accountStatus = state.getAccountStatus()
    if (!accountStatus.loginReady) {
      wx.showToast({ title: '先完成微信登录', icon: 'none' })
      return
    }

    if (!this.isCloudSyncConfigured()) {
      wx.showToast({ title: '云端未配置', icon: 'none' })
      return
    }

    wx.showModal({
      title: '从云端恢复',
      content: '会用云端最近一次同步数据覆盖当前本机上的孩子档案、任务、收藏和开包记录。确认恢复？',
      confirmText: '恢复',
      confirmColor: '#7BA68C',
      success: (modalRes) => {
        if (!modalRes.confirm) return
        this.fetchCloudData()
      }
    })
  },

  fetchCloudData() {
    this.setData({
      syncBusy: true,
      restoreCloudButtonText: '恢复中'
    })
    wx.showLoading({ title: '恢复中' })

    wx.cloud.callFunction({
      name: 'getUserData',
      success: (res) => {
        if (!res.result || !res.result.ok) {
          const message = res.result && res.result.message ? res.result.message : '云端没有可恢复数据'
          wx.showToast({ title: message, icon: 'none' })
          return
        }

        const result = state.restoreCloudPayload(res.result.payload)
        wx.showToast({ title: result.message, icon: result.ok ? 'success' : 'none' })
        if (result.ok) this.refreshSettings()
      },
      fail: (error) => {
        wx.showToast({
          title: error && error.errMsg ? '恢复失败' : '恢复失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
        this.setData({
          syncBusy: false,
          restoreCloudButtonText: '云端恢复'
        })
      }
    })
  },

  isCloudSyncConfigured() {
    const app = getApp()
    return Boolean(
      app.globalData &&
      app.globalData.cloudSyncEnabled &&
      wx.cloud &&
      wx.cloud.callFunction
    )
  },

  createLocalBackup() {
    const backup = state.saveLocalBackup()
    const backupInfo = state.getLocalBackupInfo()
    this.setData({
      backupExists: backupInfo.exists,
      backupSummary: this.buildBackupSummary(backupInfo)
    })
    wx.showToast({ title: backup.createdDate ? '已备份' : '已保存', icon: 'success' })
  },

  restoreLocalBackup() {
    wx.showModal({
      title: '恢复本地备份',
      content: '会用备份覆盖当前本机上的任务、收藏、档案和开包记录。确认恢复？',
      confirmText: '恢复',
      confirmColor: '#7BA68C',
      success: (res) => {
        if (!res.confirm) return
        const result = state.restoreLocalBackup()
        wx.showToast({ title: result.message, icon: result.ok ? 'success' : 'none' })
        if (result.ok) this.refreshSettings()
      }
    })
  },

  clearLocalBackup() {
    wx.showModal({
      title: '删除本地备份',
      content: '只删除备份快照，不会删除当前任务和收藏。',
      confirmText: '删除',
      confirmColor: '#C85A54',
      success: (res) => {
        if (!res.confirm) return
        state.clearLocalBackup()
        this.setData({
          backupExists: false,
          backupSummary: '还没有本地备份'
        })
        wx.showToast({ title: '已删除备份', icon: 'success' })
      }
    })
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

  revealDebugTools() {
    wx.showModal({
      title: '家长验证',
      content: '请输入 8 + 7 的答案',
      editable: true,
      placeholderText: '答案',
      confirmText: '验证',
      confirmColor: '#7BA68C',
      success: (res) => {
        if (!res.confirm) return
        if (String(res.content || '').trim() !== '15') {
          wx.showToast({ title: '验证未通过', icon: 'none' })
          return
        }
        this.setData({ debugVisible: true })
        wx.showToast({ title: '已显示调试工具', icon: 'none' })
      }
    })
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
