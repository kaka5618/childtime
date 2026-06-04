App({
  onLaunch() {
    if (this.globalData.cloudSyncEnabled && wx.cloud) {
      wx.cloud.init({
        traceUser: true
      })
    }
  },

  globalData: {
    seriesId: 'star_dream_bubble',
    cloudSyncEnabled: false,
    cloudSyncFunction: 'syncUserData'
  }
})
