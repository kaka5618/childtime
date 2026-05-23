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
      owned: Boolean(collection[card.id])
    }))
    this.setData({
      cards: viewCards,
      ownedCount: viewCards.filter((card) => card.owned).length
    })
  }
})
