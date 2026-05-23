const { getCard } = require('../../utils/cards')
const state = require('../../utils/state')

Page({
  data: {
    card: null,
    count: 0
  },

  onLoad(query) {
    const card = getCard(query.id)
    const collection = state.getCollection()

    if (!card || !collection[card.id]) {
      wx.showToast({ title: '卡片未获得', icon: 'none' })
      wx.navigateBack()
      return
    }

    this.setData({
      card,
      count: collection[card.id]
    })
  }
})
