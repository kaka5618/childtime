const state = require('../../utils/state')
const { themes } = require('../../utils/themes')
const { getCard } = require('../../utils/cards')

function buildThemeView(theme) {
  const previewCards = (theme.previewCardIds || [])
    .map((id) => getCard(id))
    .filter(Boolean)

  return {
    ...theme,
    previewCards,
    hasPreviewCards: previewCards.length > 0
  }
}

Page({
  data: {
    themes: themes.map(buildThemeView),
    selectedId: '',
    pendingId: '',
    pendingTheme: null
  },

  onShow() {
    const selectedId = state.getActiveSeriesId()
    const pendingTheme = this.data.themes.find((theme) => theme.id === selectedId) || null
    this.setData({
      selectedId,
      pendingId: selectedId,
      pendingTheme
    })
  },

  selectTheme(event) {
    const { id, status } = event.currentTarget.dataset

    if (status !== 'active') {
      wx.showToast({ title: '这套卡包即将开放', icon: 'none' })
      return
    }

    const pendingTheme = this.data.themes.find((theme) => theme.id === id)
    this.setData({
      pendingId: id,
      pendingTheme
    })
  },

  confirmTheme() {
    if (!this.data.pendingId) return
    state.setActiveSeriesId(this.data.pendingId)
    wx.redirectTo({ url: '/pages/home/home' })
  }
})
