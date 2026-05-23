const { cards } = require('../../utils/cards')
const state = require('../../utils/state')

Page({
  data: {
    cards: [],
    ownedCount: 0
  },

  onShow() {
    const collection = state.getCollection()
    const viewCards = cards.map((card) => ({
      ...card,
      count: collection[card.id] || 0,
      owned: Boolean(collection[card.id]),
      canSynthesize: (collection[card.id] || 0) >= 4
    }))
    this.setData({
      cards: viewCards,
      ownedCount: viewCards.filter((card) => card.owned).length
    })
  },

  openCard(event) {
    const { id, owned } = event.currentTarget.dataset
    if (!owned) {
      wx.showToast({ title: '还没有获得这张卡', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `/pages/card-detail/card-detail?id=${id}` })
  },

  synthesizeCard(event) {
    const { id, name } = event.currentTarget.dataset

    wx.showModal({
      title: '合成卡包',
      content: `消耗 4 张「${name}」合成 1 个新卡包？`,
      confirmText: '合成',
      confirmColor: '#7BA68C',
      success: (res) => {
        if (!res.confirm) return

        const result = state.synthesizePack(id)
        if (!result.ok) {
          wx.showToast({ title: result.message, icon: 'none' })
          this.onShow()
          return
        }

        wx.navigateTo({ url: '/pages/pack-open/pack-open?source=synthesis' })
      }
    })
  }
})
