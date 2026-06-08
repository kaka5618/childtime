const { getCard } = require('../../utils/cards')
const { resolveCard } = require('../../utils/cloud-assets')
const cloudSync = require('../../utils/cloud-sync')
const state = require('../../utils/state')

Page({
  data: {
    card: null,
    count: 0,
    owned: false,
    canSynthesize: false,
    needForSynthesis: 4,
    remainingAfterSynthesis: 0,
    consumeCount: 3,
    synthesisTitle: '',
    synthesisNote: '',
    statusBadge: '',
    detailClass: '',
    obtainHint: ''
  },

  onLoad(query) {
    this.cardId = query.id
    this.loadCard()
  },

  onShow() {
    if (this.cardId) this.loadCard()
  },

  loadCard() {
    const seriesId = state.getActiveSeriesId()
    const card = getCard(seriesId, this.cardId)

    if (!card) {
      wx.showToast({ title: '没有找到这张卡', icon: 'none' })
      wx.navigateBack()
      return
    }

    const plan = state.getSynthesisPlan(card.id, seriesId)
    const owned = plan.count > 0
    this.setData({
      card,
      owned,
      count: plan.count,
      canSynthesize: plan.canSynthesize,
      needForSynthesis: plan.needCount,
      remainingAfterSynthesis: plan.remainingCount,
      consumeCount: plan.consumeCount,
      detailClass: `rarity-${card.rarity} ${owned ? 'owned-card' : 'locked-card'}`,
      synthesisTitle: owned
        ? (plan.canSynthesize ? '魔法盒可以合成卡包' : '继续收集重复卡')
        : '还没有收藏到这张卡',
      synthesisNote: owned
        ? (plan.canSynthesize
        ? `消耗 ${plan.consumeCount} 张重复卡，合成后还保留 ${plan.remainingCount} 张。`
        : `还差 ${plan.needCount} 张可合成。`)
        : '完成每日计划、装满能量袋后，开卡包有机会获得。',
      statusBadge: owned ? '合成状态' : '获取提示',
      obtainHint: owned ? '已经放进收藏本' : '获取方式：完成今日任务后开启卡包'
    })
    resolveCard(card).then((resolvedCard) => {
      this.setData({ card: resolvedCard })
    })
  },

  synthesizeCard() {
    if (!this.data.card) return

    wx.showModal({
      title: '合成卡包',
      content: `消耗 3 张「${this.data.card.name}」合成 1 个新卡包，剩余的继续留在收藏本？`,
      confirmText: '合成',
      confirmColor: '#7BA68C',
      success: (res) => {
        if (!res.confirm) return

        const result = state.synthesizePack(this.data.card.id, state.getActiveSeriesId())
        if (!result.ok) {
          wx.showToast({ title: result.message, icon: 'none' })
          this.loadCard()
          return
        }

        cloudSync.scheduleSync()
        wx.redirectTo({ url: '/pages/pack-open/pack-open?source=synthesis' })
      }
    })
  },

  goAlbum() {
    wx.navigateBack()
  }
})
