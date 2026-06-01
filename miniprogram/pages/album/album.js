const { getCardsBySeries } = require('../../utils/cards')
const state = require('../../utils/state')
const { getTheme } = require('../../utils/themes')

Page({
  data: {
    cards: [],
    filteredCards: [],
    ownedCount: 0,
    activeTheme: null,
    activeThemeName: '星梦泡泡',
    activeThemeAccent: '#7BA68C',
    rewardVisible: false,
    rewardCards: [],
    rewardTitle: '',
    rewardSubtitle: '',
    emptyVisible: false,
    statusFilter: 'all',
    rarityFilter: 'ALL',
    statusFilters: [
      { key: 'all', label: '全部', activeClass: 'active' },
      { key: 'owned', label: '已获得' },
      { key: 'missing', label: '未获得' },
      { key: 'synthesis', label: '可合成' }
    ],
    rarityFilters: [
      { key: 'ALL', label: 'ALL', activeClass: 'active' },
      { key: 'N', label: 'N' },
      { key: 'R', label: 'R' },
      { key: 'SR', label: 'SR' },
      { key: 'SSR', label: 'SSR' }
    ]
  },

  onShow() {
    const seriesId = state.getActiveSeriesId()
    const collection = state.getSeriesCollection(seriesId)
    const cards = getCardsBySeries(seriesId)
    const collectionProgress = state.getCollectionProgress(seriesId)
    const recentReward = state.getRecentRewardPack()
    const rewardCards = this.buildRewardCards(recentReward.pack)
    const viewCards = cards.map((card) => ({
      ...card,
      ...this.buildCardState(card, collection, seriesId)
    }))
    const activeTheme = getTheme(seriesId)
    this.setData({
      cards: viewCards,
      ownedCount: viewCards.filter((card) => card.owned).length,
      activeTheme,
      activeThemeName: activeTheme ? activeTheme.name : '星梦泡泡',
      activeThemeAccent: activeTheme ? activeTheme.accent : '#7BA68C',
      collectionProgress,
      rewardVisible: rewardCards.length > 0,
      rewardCards,
      rewardTitle: recentReward.sourceText ? '最近获得' : '',
      rewardSubtitle: this.getRewardSubtitle(recentReward.sourceText, recentReward.pack)
    })
    this.applyFilters()
  },

  buildRewardCards(pack) {
    return pack.map((card) => ({
      ...card,
      badgeText: card.isNew ? '新卡' : '重复'
    }))
  },

  getRewardSubtitle(sourceText, pack) {
    if (!pack.length) return ''
    const newCount = pack.filter((card) => card.isNew).length
    return `${sourceText} · ${pack.length} 张 · 新卡 ${newCount} 张`
  },

  buildCardState(card, collection, seriesId) {
    const plan = state.getSynthesisPlan(card.id, seriesId)
    return {
      count: collection[card.id] || 0,
      owned: Boolean(collection[card.id]),
      canSynthesize: plan.canSynthesize,
      synthesisHint: state.getSynthesisReadyText(card.id, seriesId)
    }
  },

  applyFilters() {
    const { cards, statusFilter, rarityFilter } = this.data
    const filteredCards = cards.filter((card) => {
      const statusMatched = (
        statusFilter === 'all' ||
        (statusFilter === 'owned' && card.owned) ||
        (statusFilter === 'missing' && !card.owned) ||
        (statusFilter === 'synthesis' && card.canSynthesize)
      )
      const rarityMatched = rarityFilter === 'ALL' || card.rarity === rarityFilter
      return statusMatched && rarityMatched
    })

    this.setData({
      filteredCards,
      emptyVisible: filteredCards.length === 0,
      statusFilters: this.data.statusFilters.map((filter) => ({
        ...filter,
        activeClass: filter.key === statusFilter ? 'active' : ''
      })),
      rarityFilters: this.data.rarityFilters.map((filter) => ({
        ...filter,
        activeClass: filter.key === rarityFilter ? 'active' : ''
      }))
    })
  },

  changeStatusFilter(event) {
    this.setData({ statusFilter: event.currentTarget.dataset.filter })
    this.applyFilters()
  },

  changeRarityFilter(event) {
    this.setData({ rarityFilter: event.currentTarget.dataset.rarity })
    this.applyFilters()
  },

  openCard(event) {
    const { id, owned } = event.currentTarget.dataset
    if (!owned) {
      wx.showToast({ title: '还没有获得这张卡', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/card-detail/card-detail?id=${id}` })
  },

  openRewardCard(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/card-detail/card-detail?id=${id}` })
  },

  synthesizeCard(event) {
    const { id, name, hint } = event.currentTarget.dataset

    wx.showModal({
      title: '合成卡包',
      content: `${hint}。确认合成「${name}」的新卡包？`,
      confirmText: '合成',
      confirmColor: '#7BA68C',
      success: (res) => {
        if (!res.confirm) return

        const result = state.synthesizePack(id, state.getActiveSeriesId())
        if (!result.ok) {
          wx.showToast({ title: result.message, icon: 'none' })
          this.onShow()
          return
        }

        wx.navigateTo({ url: '/pages/pack-open/pack-open?source=synthesis' })
      }
    })
  },

  goThemeSelect() {
    wx.navigateTo({ url: '/pages/theme-select/theme-select' })
  }
})
