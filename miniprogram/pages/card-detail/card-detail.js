const { getCard } = require('../../utils/cards')
const state = require('../../utils/state')

Page({
  data: {
    card: null,
    count: 0,
    canSynthesize: false,
    needForSynthesis: 4,
    synthesisTitle: '',
    synthesisNote: ''
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
    const collection = state.getSeriesCollection(seriesId)

    if (!card || !collection[card.id]) {
      wx.showToast({ title: '卡片未获得', icon: 'none' })
      wx.navigateBack()
      return
    }

    const count = collection[card.id]
    this.setData({
      card,
      count,
      canSynthesize: count >= 4,
      needForSynthesis: Math.max(0, 4 - count),
      synthesisTitle: count >= 4 ? '可以合成新卡包' : '继续收集重复卡',
      synthesisNote: count >= 4 ? '消耗 3 张重复卡，保留 1 张收藏卡，获得 1 个额外卡包。' : `还差 ${Math.max(0, 4 - count)} 张可合成。`
    })
  },

  synthesizeCard() {
    if (!this.data.card) return

    wx.showModal({
      title: '合成卡包',
      content: `消耗 3 张「${this.data.card.name}」合成 1 个新卡包，并保留 1 张收藏卡？`,
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

        wx.redirectTo({ url: '/pages/pack-open/pack-open?source=synthesis' })
      }
    })
  },

  goAlbum() {
    wx.navigateBack()
  }
})
