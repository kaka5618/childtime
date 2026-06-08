const state = require('../../utils/state')
const cloudSync = require('../../utils/cloud-sync')
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
    verifyCloudButtonText: '验证同步',
    syncBusy: false,
    syncBusyClass: '',
    backupExists: false,
    backupSummary: '还没有本地备份',
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
        verifyCloudButtonText: '验证同步',
        syncBusy: false,
        syncBusyClass: '',
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
        verifyCloudButtonText: '验证同步',
        syncBusy: false,
        syncBusyClass: '',
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

  buildPayloadSummary(payload) {
    const cloudData = payload && payload.data ? payload.data : {}
    const tasksByDate = cloudData.tasksByDate || {}
    const collection = cloudData.collection || {}
    const taskCount = Object.keys(tasksByDate).reduce((total, key) => {
      const tasks = Array.isArray(tasksByDate[key]) ? tasksByDate[key] : []
      return total + tasks.length
    }, 0)
    const cardCount = Object.keys(collection).reduce((total, seriesId) => {
      const series = collection[seriesId] || {}
      return total + Object.keys(series).filter((cardId) => Number(series[cardId] || 0) > 0).length
    }, 0)
    const childName = cloudData.childProfile && cloudData.childProfile.name
      ? cloudData.childProfile.name
      : '未填写名字'

    return `孩子：${childName} · 任务 ${taskCount} 个 · 收藏 ${cardCount} 张`
  },

  payloadDataMatches(localPayload, cloudPayload) {
    const localData = localPayload && localPayload.data ? localPayload.data : {}
    const cloudData = cloudPayload && cloudPayload.data ? cloudPayload.data : {}
    return this.stableStringify(localData) === this.stableStringify(cloudData)
  },

  stableStringify(value) {
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`
    }
    if (value && typeof value === 'object') {
      return `{${Object.keys(value).sort().map((key) => {
        return `${JSON.stringify(key)}:${this.stableStringify(value[key])}`
      }).join(',')}}`
    }
    return JSON.stringify(value)
  },

  formatCloudError(error, fallbackText) {
    const message = String(
      (error && (error.errMsg || error.message)) || fallbackText || '云端调用失败'
    )
    if (/FUNCTION_NOT_FOUND|FunctionName parameter could not be found/i.test(message)) {
      return '云函数还没有部署'
    }
    if (/collection not exists|Db or Table not exist|DATABASE_COLLECTION_NOT_EXIST|-502005/i.test(message)) {
      return '云数据库集合还没创建'
    }
    if (/timeout/i.test(message)) {
      return '云端响应超时，请稍后重试'
    }
    if (message.length > 42) return `${message.slice(0, 42)}...`
    return message
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
    cloudSync.scheduleSync()
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  selectAvatar(event) {
    const { key, emoji } = event.currentTarget.dataset
    const profile = state.saveChildProfile({ avatarKey: key, avatarEmoji: emoji })
    this.setData({
      avatarEmoji: profile.avatarEmoji,
      avatarOptions: this.buildAvatarOptions(profile.avatarKey)
    })
    cloudSync.scheduleSync()
  },

  selectGrade(event) {
    const { key, label } = event.currentTarget.dataset
    const profile = state.saveChildProfile({ gradeKey: key, gradeLabel: label })
    this.setData({
      gradeLabel: profile.gradeLabel,
      gradeOptions: this.buildGradeOptions(profile.gradeKey)
    })
    cloudSync.scheduleSync()
  },

  changeDailyTarget(event) {
    const profile = state.saveChildProfile({ dailyTargetMinutes: Number(event.detail.value) })
    this.setData({ dailyTargetMinutes: profile.dailyTargetMinutes })
    cloudSync.scheduleSync()
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
      syncBusyClass: 'disabled',
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
            lastError: this.formatCloudError(null, errorMessage)
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
          lastError: this.formatCloudError(error, '云函数调用失败')
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
          syncBusyClass: '',
          syncButtonText: '同步云端'
        })
      }
    })
  },

  verifyCloudData() {
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

    this.setData({
      syncBusy: true,
      syncBusyClass: 'disabled',
      verifyCloudButtonText: '验证中'
    })
    wx.showLoading({ title: '验证中' })

    wx.cloud.callFunction({
      name: 'getUserData',
      success: (res) => {
        if (!res.result || !res.result.ok) {
          const message = res.result && res.result.message ? res.result.message : '云端没有可验证数据'
          wx.showModal({
            title: '还不能验证',
            content: message,
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }

        const localPayload = state.buildCloudSyncPayload()
        const cloudPayload = res.result.payload
        const summary = this.buildPayloadSummary(cloudPayload)
        const matched = this.payloadDataMatches(localPayload, cloudPayload)

        const syncStatus = state.saveCloudSyncStatus({
          cloudLinked: matched,
          lastResult: matched ? 'success' : 'failed',
          lastSyncAt: matched ? new Date().toISOString() : '',
          lastError: matched ? '' : '云端和本机不一致'
        })
        const nextAccountStatus = state.getAccountStatus()
        this.setData({
          accountSummary: this.buildAccountSummary(nextAccountStatus),
          accountBadgeText: this.buildAccountBadgeText(nextAccountStatus),
          syncSummary: this.buildSyncSummary(syncStatus)
        })

        wx.showModal({
          title: matched ? '验证通过' : '需要重新同步',
          content: matched
            ? `云端数据和本机一致。\n${summary}`
            : `云端数据和本机不一致，请先点“同步云端”再验证。\n${summary}`,
          showCancel: false,
          confirmText: '知道了'
        })
      },
      fail: (error) => {
        const message = this.formatCloudError(error, '验证失败')
        wx.showModal({
          title: '验证失败',
          content: message,
          showCancel: false,
          confirmText: '知道了'
        })
      },
      complete: () => {
        wx.hideLoading()
        this.setData({
          syncBusy: false,
          syncBusyClass: '',
          verifyCloudButtonText: '验证同步'
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
      content: '会先自动保存当前本机备份，再用云端最近一次同步数据覆盖孩子档案、任务、收藏和开包记录。确认恢复？',
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
      syncBusyClass: 'disabled',
      restoreCloudButtonText: '恢复中'
    })
    wx.showLoading({ title: '恢复中' })

    wx.cloud.callFunction({
      name: 'getUserData',
      success: (res) => {
        if (!res.result || !res.result.ok) {
          const message = res.result && res.result.message ? res.result.message : '云端没有可恢复数据'
          wx.showToast({ title: this.formatCloudError(null, message), icon: 'none' })
          return
        }

        const backup = state.saveLocalBackup()
        const result = state.restoreCloudPayload(res.result.payload)
        if (!result.ok) {
          wx.showToast({ title: result.message, icon: 'none' })
          return
        }

        const backupInfo = state.getLocalBackupInfo()
        wx.showModal({
          title: '已从云端恢复',
          content: `恢复前已自动保存本机备份。\n备份日期：${backup.createdDate || backupInfo.createdDate}`,
          showCancel: false,
          confirmText: '知道了'
        })
        this.refreshSettings()
      },
      fail: (error) => {
        wx.showToast({
          title: this.formatCloudError(error, '恢复失败'),
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
        this.setData({
          syncBusy: false,
          syncBusyClass: '',
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
      content: '会用最近一次本地备份覆盖当前本机上的任务、收藏、档案和开包记录。这个备份也可能是云端恢复前自动保存的。确认恢复？',
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

  openPrivacyGuide() {
    if (wx.openPrivacyContract) {
      wx.openPrivacyContract({
        fail: () => {
          wx.showToast({ title: '请先在微信后台配置隐私指引', icon: 'none' })
        }
      })
      return
    }

    wx.showToast({ title: '当前环境暂不支持查看', icon: 'none' })
  },

  toggleVoice(event) {
    const voiceEnabled = event.detail.value
    state.saveSettings({ voiceEnabled })
    this.setData({
      voiceEnabled,
      voiceOptionsClass: voiceEnabled ? '' : 'disabled'
    })
    cloudSync.scheduleSync()
  },

  changeVoiceType(event) {
    const { type } = event.currentTarget.dataset
    state.saveSettings({ voiceType: type })
    this.setData({
      voiceType: type,
      voiceTypes: this.buildVoiceTypes(type)
    })
    cloudSync.scheduleSync()
  },

  changeVolume(event) {
    const volume = Number(event.detail.value)
    state.saveSettings({ volume })
    this.setData({ volume })
    cloudSync.scheduleSync()
  }
})
