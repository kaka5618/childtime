App({
  onLaunch() {},

  hasCloudRuntime() {
    return Boolean(
      this.globalData.cloudSyncEnabled &&
      typeof wx !== 'undefined' &&
      wx.cloud &&
      wx.cloud.callFunction
    )
  },

  initCloud() {
    if (!this.hasCloudRuntime()) return false
    if (this.globalData.cloudInitialized) return true

    const cloudConfig = {
      traceUser: false
    }
    if (this.globalData.cloudEnvId) {
      cloudConfig.env = this.globalData.cloudEnvId
    }
    wx.cloud.init(cloudConfig)
    this.globalData.cloudInitialized = true
    return true
  },

  globalData: {
    seriesId: 'star_dream_bubble',
    cloudSyncEnabled: true,
    cloudAutoSyncEnabled: false,
    cloudInitialized: false,
    cloudEnvId: 'cloudbase-d3g0zqjt752827234',
    cloudSyncFunction: 'syncUserData',
    cloudAssetBaseFileID: 'cloud://cloudbase-d3g0zqjt752827234.636c-cloudbase-d3g0zqjt752827234-1435290004/card-assets',
    cloudAssetFileIDs: {}
  }
})
