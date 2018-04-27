const city = require('../../utils/city.js');
const cityObjs = require('../../utils/city.js');
const appInstance = getApp();
Page({
  data: {
    searchLetter: [],
    showLetter: "",
    winHeight: 0,
    cityList: [],
    isShowLetter: false,
    scrollTop: 0,//置顶高度
    scrollTopId: '',//置顶id
    city: "定位中",
    currentCityCode: '',
    keys: "F2GBZ-SREWQ-A3K56-GSLK5-ELOHS-PRB2X",
    hotcityList: [{ cityCode: 110000, city: '北京市' }, { cityCode: 310000, city: '上海市' }, { cityCode: 440100, city: '广州市' }, { cityCode: 440300, city: '深圳市' }, { cityCode: 330100, city: '杭州市' }, { cityCode: 320100, city: '南京市' }, { cityCode: 420100, city: '武汉市' },  { cityCode: 120000, city: '天津市' }, { cityCode: 610100, city: '西安市' }, ],
    commonCityList: [{ cityCode: 110000, city: '北京市' }, { cityCode: 310000, city: '上海市' }],
    countyList: [{ cityCode: 110000, county: 'X区' }, { cityCode: 310000, county: 'X区' }, { cityCode: 440100, county: 'X区' }, { cityCode: 440300, county: 'X区' }, { cityCode: 330100, county: 'X县' }, { cityCode: 320100, county: 'X县' }, { cityCode: 420100, county: 'X县' }],
    inputName: '',
    completeList: [],
    county: '',
    condition: false,
  },
  onLoad: function () {
    const searchLetter = city.searchLetter;
    const cityList = city.cityList();
    const sysInfo = wx.getSystemInfoSync();
    const winHeight = sysInfo.windowHeight;
    const itemH = winHeight / searchLetter.length;
    let tempArr = [];

    searchLetter.map(
      (item,index) => {
        let temp = {};
        temp.name = item;
        temp.tHeight = index * itemH;
        temp.bHeight = (index + 1) * itemH;
        tempArr.push(temp)
      }
    );

    this.setData({
      winHeight: winHeight,
      itemH: itemH,
      searchLetter: tempArr,
      cityList: cityList
    });

    this.getLocation();

  },

  clickLetter: function (e) {
    const showLetter = e.currentTarget.dataset.letter;
    this.setData({
      toastShowLetter: showLetter,
      isShowLetter: true,
      scrollTopId: showLetter,
    })

    const that = this;
    setTimeout(function () {
      that.setData({
        isShowLetter: false
      })
    }, 500)
  },
  //选择城市
  bindCity: function (e) {
    this.setData({
      condition:true,
      city: e.currentTarget.dataset.city,
      currentCityCode: e.currentTarget.dataset.code,
      scrollTop: 0,
      completeList: [],
    })
    this.selectCounty()

    appInstance.globalData.defaultCity = this.data.city
    appInstance.globalData.defaultCounty = ''
  },

  bindCounty: function(e) {
    this.setData({ county: e.currentTarget.dataset.city })
    appInstance.globalData.defaultCounty = this.data.county
    console.log('你所选的城市是：'+ appInstance.globalData.defaultCity + appInstance.globalData.defaultCounty);

    wx.redirectTo({
      url: '../index/index'
    })
  },

  //点击热门城市回到顶部
  hotCity: function () {
    this.setData({
      scrollTop: 0,
    })
  },
  selectCounty: function() {
    let code = this.data.currentCityCode
    let keys = this.data.keys
    const that = this;
    wx.request({
      url: `https://apis.map.qq.com/ws/district/v1/getchildren?&id=${code}&key=${keys}`,
      success: function(res) {
        that.setData({
          countyList: res.data.result[0]
        })
        console.log(res)
      },
      fail: function() {
        console.log("请求失败，请重试");
      }
    })
  },
  getLocation: function() {
    this.setData({
      county: ''
    })
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        let latitude = res.latitude
        let longitude = res.longitude
        let keys = that.data.keys
        wx.request({
            url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${keys}`,
            success: res => {
              that.setData({
                city: res.data.result.ad_info.city,
                currentCityCode: res.data.result.ad_info.adcode,
                county: res.data.result.ad_info.district
              })
              that.selectCounty();
            }
        })
      }
    })
  },
  bindBlur: function(e) {
    this.setData({
      inputName: ''
    })
  },
  bindKeyInput: function(e) {
    this.setData({
      inputName: e.detail.value
    })
    this.auto()
  },
  auto: function () {
    let inputSd = this.data.inputName.trim()
    let sd = inputSd.toLowerCase()
    let num = sd.length
    const cityList = cityObjs.cityObjs
    let finalCityList = []

    let temp = cityList.filter(
      item => {
        let text = item.short.slice(0, num).toLowerCase()
        return (text && text == sd)
      }
    )
    let tempShorter = cityList.filter(
      itemShorter => {
        if (itemShorter.shorter) {
          let textShorter = itemShorter.shorter.slice(0, num).toLowerCase()
        return (textShorter && textShorter == sd)
        }
        return
      }
    )

    let tempChinese = cityList.filter(
      itemChinese => {
        let textChinese = itemChinese.city.slice(0, num)
        return (textChinese && textChinese == sd)
      }
    )

    if (temp[0]) {
      temp.map(
        item => {
          let testObj = {};
          testObj.city = item.city
          testObj.code = item.code
          finalCityList.push(testObj)
        }
      )
      this.setData({
        completeList: finalCityList,
      })
    } else if (tempShorter[0]) {
      tempShorter.map(
        item => {
          let testObj = {};
          testObj.city = item.city
          testObj.code = item.code
          finalCityList.push(testObj)
        }
      );
      this.setData({
        completeList: finalCityList,
      })
    } else if (tempChinese[0]) {
      tempChinese.map(
        item => {
          let testObj = {};
          testObj.city = item.city
          testObj.code = item.code
          finalCityList.push(testObj)
        })
      this.setData({
        completeList: finalCityList,
      })
    } else {
      return
    }
  },
})
