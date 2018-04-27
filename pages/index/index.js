// index.js
const appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
   location: appInstance.globalData.defaultCity,
   county: appInstance.globalData.defaultCounty,
 },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
          location: appInstance.globalData.defaultCity,
          county: appInstance.globalData.defaultCounty
        })
  },

})
