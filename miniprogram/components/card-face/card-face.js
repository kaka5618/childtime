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
  }
})
