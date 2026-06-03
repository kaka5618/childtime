const state = require('../../utils/state')
const { getTheme, getActiveTheme } = require('../../utils/themes')

function getCurrentTheme() {
  return getTheme(state.getActiveSeriesId()) || getActiveTheme()
}

Page({
  data: {
    pack: [],
    revealCards: [],
    newCount: 0,
    resultTitle: '',
    resultSubtitle: '',
    revealed: false,
    claimed: false,
    opening: false,
    source: 'daily',
    activeTheme: null,
    openingClass: '',
    packTitle: '',
    packHint: '',
    packMark: '?',
    openButtonText: '打开卡包'
  },

  openTimer: null,

  buildRevealCards(pack) {
    return pack.map((card, index) => ({
      ...card,
      revealDelay: `${index * 220}ms`,
      badgeText: card.isNew ? '新卡' : '重复',
      badgeClass: card.isNew ? 'new-badge' : 'duplicate-badge',
      rewardText: card.isNew ? '加入收藏本' : '可用于合成',
      rareClass: card.rarity === 'SSR' || card.rarity === 'SR' ? 'rare-prize' : 'normal-prize'
    }))
  },

  onLoad(query) {
    const source = query.source || 'daily'
    const activeTheme = getCurrentTheme()

    if (source === 'synthesis') {
      const pack = state.getLastPack()
      if (!pack.length) {
        wx.showToast({ title: '没有可展示的卡包', icon: 'none' })
        wx.navigateBack()
        return
      }
      this.setPackData(pack, source, activeTheme)
      return
    }

    if (!state.allCompleted(state.getTasks())) {
      wx.showToast({ title: '先完成今日任务', icon: 'none' })
      wx.navigateBack()
      return
    }
    const pack = state.hasGeneratedToday() ? state.getLastPack() : state.prepareDailyPack()
    this.setPackData(pack, source, activeTheme)
  },

  onUnload() {
    if (this.openTimer) {
      clearTimeout(this.openTimer)
      this.openTimer = null
    }
  },

  beginOpen() {
    if (this.data.opening) return

    this.setData({
      opening: true,
      openingClass: 'opening',
      openButtonText: '宝箱开启中'
    })
    this.openTimer = setTimeout(() => {
      this.reveal()
    }, 3000)
  },

  setPackData(pack, source, activeTheme) {
    const revealCards = this.buildRevealCards(pack)
    const newCount = pack.filter((card) => card.isNew).length
    const duplicateCount = Math.max(0, pack.length - newCount)
    this.setData({
      pack,
      revealCards,
      source,
      activeTheme,
      packTitle: source === 'synthesis' ? '合成卡包' : activeTheme.packTitle,
      packHint: source === 'synthesis' ? '重复卡变成了新的惊喜。' : activeTheme.packHint,
      packMark: activeTheme.shortName || '?',
      newCount,
      resultTitle: `获得 ${pack.length} 张卡`,
      resultSubtitle: `新卡 ${newCount} 张 · 重复 ${duplicateCount} 张`
    })
  },

  reveal() {
    if (this.data.source === 'daily' && !this.data.claimed && !state.hasOpenedToday()) {
      state.claimLastPack()
      state.markOpenedToday()
    }
    this.setData({
      revealed: true,
      opening: false,
      claimed: true,
      openingClass: '',
      openButtonText: '打开卡包'
    })
  },

  goAlbum() {
    wx.redirectTo({ url: '/pages/album/album' })
  },

  openCard(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/card-detail/card-detail?id=${id}` })
  }
})
