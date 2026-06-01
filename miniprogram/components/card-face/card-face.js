Component({
  properties: {
    card: {
      type: Object,
      value: null
    },
    owned: {
      type: Boolean,
      value: true
    },
    count: {
      type: Number,
      value: 0
    },
    size: {
      type: String,
      value: 'medium'
    },
    showCount: {
      type: Boolean,
      value: false
    }
  },

  data: {
    lockedClass: '',
    displayName: '未获得',
    countText: 0
  },

  observers: {
    'card, owned, count': function (card, owned, count) {
      this.setData({
        lockedClass: owned ? '' : 'locked',
        displayName: owned && card ? card.name : '未获得',
        countText: count || 0
      })
    }
  }
})
