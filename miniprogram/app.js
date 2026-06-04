App({
  onLaunch() {
    if (this.globalData.cloudSyncEnabled && wx.cloud) {
      const cloudConfig = {
        traceUser: true
      }
      if (this.globalData.cloudEnvId) {
        cloudConfig.env = this.globalData.cloudEnvId
      }
      wx.cloud.init(cloudConfig)
    }
  },

  globalData: {
    seriesId: 'star_dream_bubble',
    cloudSyncEnabled: true,
    cloudEnvId: '',
    cloudSyncFunction: 'syncUserData',
    cloudAssetBaseFileID: '',
    cloudAssetFileIDs: {}
  }
})
