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
    cloudAutoSyncEnabled: false,
    cloudEnvId: 'cloudbase-d3g0zqjt752827234',
    cloudSyncFunction: 'syncUserData',
    cloudAssetBaseFileID: 'cloud://cloudbase-d3g0zqjt752827234.636c-cloudbase-d3g0zqjt752827234-1435290004/card-assets',
    cloudAssetFileIDs: {}
  }
})
