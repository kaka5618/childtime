const state = require('../../utils/state')
const cloudSync = require('../../utils/cloud-sync')
const { themes } = require('../../utils/themes')
const { getCard, getCardsBySeries } = require('../../utils/cards')
const { resolveCards } = require('../../utils/cloud-assets')

function buildThemeView(theme) {
  const previewCards = (theme.previewCardIds || [])
    .map((id) => getCard(theme.id, id))
    .filter(Boolean)
  const progress = state.getCollectionProgress(theme.id)
  const cards = getCardsBySeries(theme.id)
  const rarityList = cards.length ? ['N', 'R', 'SR', 'SSR'] : ['即将开放']

  return {
    ...theme,
    previewCards,
    hasPreviewCards: previewCards.length > 0,
    hasCoverSymbol: previewCards.length === 0,
    ownedCount: progress.owned,
    totalCount: progress.total,
    progressText: progress.total ? `${progress.owned}/${progress.total}` : '预览',
    progressWidth: `${Math.max(8, progress.percent)}%`,
    rarityText: rarityList.join(' · '),
    packNote: theme.status === 'active' ? '今日能量满后可开启' : '更多卡片正在制作'
  }
}

function buildPageView(themesSource, selectedId, pendingId, pendingTheme, cooldownInfo) {
  const cooldownBlocked = Boolean(cooldownInfo && !cooldownInfo.canSwitch)
  return {
    themes: themesSource.map((theme) => {
      const selected = pendingId === theme.id
      const active = theme.status === 'active'
      return {
        ...theme,
        cardClass: [
          theme.coverClass,
          active ? '' : 'preview',
          selected ? 'selected' : ''
        ].filter(Boolean).join(' '),
        statusText: active ? (selectedId === theme.id ? '当前收集' : '可选择') : '即将开放'
      }
    }),
    pageClass: pendingTheme ? 'has-confirm' : '',
    confirmLabel: selectedId === pendingId ? '当前收集' : '准备收集',
    confirmButtonText: selectedId === pendingId ? '继续收集' : '开始收集',
    confirmButtonClass: cooldownBlocked ? 'disabled' : '',
    cooldownVisible: cooldownBlocked
  }
}

Page({
  data: {
    themes: themes.map(buildThemeView),
    selectedId: '',
    pendingId: '',
    pendingTheme: null,
    cooldownInfo: null,
    pageClass: '',
    confirmLabel: '准备收集',
    confirmButtonText: '开始收集',
    confirmButtonClass: '',
    cooldownVisible: false
  },

  onShow() {
    const themeViews = themes.map(buildThemeView)
    const selectedId = state.getActiveSeriesId()
    const pendingTheme = themeViews.find((theme) => theme.id === selectedId) || null
    const cooldownInfo = pendingTheme ? state.getSwitchCooldownInfo(selectedId) : null
    this.setData({
      themes: themeViews,
      selectedId,
      pendingId: selectedId,
      pendingTheme,
      cooldownInfo,
      ...buildPageView(themeViews, selectedId, selectedId, pendingTheme, cooldownInfo)
    })
    this.resolveThemePreviewImages(themeViews)
  },

  resolveThemePreviewImages(themeViews) {
    const previewCards = []
    themeViews.forEach((theme) => {
      previewCards.push(...theme.previewCards)
    })
    resolveCards(previewCards).then((resolvedCards) => {
      let cursor = 0
      const resolvedThemeViews = themeViews.map((theme) => {
        const count = theme.previewCards.length
        const nextPreviewCards = resolvedCards.slice(cursor, cursor + count)
        cursor += count
        return {
          ...theme,
          previewCards: nextPreviewCards
        }
      })
      this.setData({
        themes: resolvedThemeViews,
        ...buildPageView(resolvedThemeViews, this.data.selectedId, this.data.pendingId, this.data.pendingTheme, this.data.cooldownInfo)
      })
    })
  },

  selectTheme(event) {
    const { id, status } = event.currentTarget.dataset

    if (status !== 'active') {
      wx.showToast({ title: '这套卡包即将开放', icon: 'none' })
      return
    }

    const pendingTheme = this.data.themes.find((theme) => theme.id === id)
    const cooldownInfo = state.getSwitchCooldownInfo(id)
    this.setData({
      pendingId: id,
      pendingTheme,
      cooldownInfo,
      ...buildPageView(this.data.themes, this.data.selectedId, id, pendingTheme, cooldownInfo)
    })
  },

  confirmTheme() {
    if (!this.data.pendingId) return

    const cooldownInfo = state.getSwitchCooldownInfo(this.data.pendingId)
    if (!cooldownInfo.canSwitch) {
      wx.showToast({
        title: `${cooldownInfo.remainingDays} 天后可更换`,
        icon: 'none'
      })
      this.setData({
        cooldownInfo,
        ...buildPageView(this.data.themes, this.data.selectedId, this.data.pendingId, this.data.pendingTheme, cooldownInfo)
      })
      return
    }

    state.setActiveSeriesId(this.data.pendingId)
    cloudSync.scheduleSync()
    wx.redirectTo({ url: '/pages/home/home' })
  }
})
