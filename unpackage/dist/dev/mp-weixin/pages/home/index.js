"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_util_mockData = require("../util/mockData.js");
const MapView = () => "../components/MapView.js";
const _sfc_main = {
  components: {
    MapView
  },
  data() {
    return {
      loading: true,
      locationReady: false,
      currentCity: "定位中",
      latitude: 0,
      longitude: 0,
      lots: [],
      refresherTriggered: false,
      // 新增数据
      viewMode: "list",
      // list, map
      selectedLot: null
    };
  },
  computed: {
    displayLocation() {
      return this.locationReady ? this.currentCity : "定位中...";
    },
    filteredLots() {
      return this.lots.filter((lot) => lot.id === "lot-wenzhou-airport");
    },
    totalAvailable() {
      return this.filteredLots.reduce((sum, item) => sum + item.availableQuota, 0);
    },
    totalLots() {
      return this.filteredLots.length;
    },
    // 地图标记点
    mapMarkers() {
      return this.filteredLots.map((lot) => {
        return {
          id: lot.id,
          latitude: lot.latitude,
          longitude: lot.longitude,
          width: 30,
          height: 30,
          // iconPath: '/static/coolc/parking-marker.png',
          callout: {
            content: lot.name,
            color: "#333",
            fontSize: 12,
            borderRadius: 4,
            bgColor: "#fff",
            padding: 5,
            display: "ALWAYS"
          }
        };
      });
    }
  },
  onLoad() {
    this.initialize();
  },
  onPullDownRefresh() {
    this.refreshData();
  },
  methods: {
    async initialize() {
      this.loading = true;
      await this.acquireLocation();
      this.loadParkingLots();
      this.$nextTick(() => {
        this.locationReady = true;
        setTimeout(() => {
          this.loading = false;
        }, 500);
      });
    },
    async acquireLocation() {
      return new Promise((resolve) => {
        common_vendor.index.getLocation({
          type: "gcj02",
          success: (res) => {
            this.latitude = res.latitude;
            this.longitude = res.longitude;
            this.currentCity = this.mockDetectCity(res.latitude, res.longitude);
            resolve();
          },
          fail: () => {
            this.currentCity = "位置授权失败";
            common_vendor.index.showToast({
              title: "无法获取当前位置",
              icon: "none"
            });
            resolve();
          }
        });
      });
    },
    loadParkingLots() {
      const lots = pages_util_mockData.getParkingLots();
      const withDistance = lots.map((item) => {
        return {
          ...item,
          distance: this.calculateDistance(
            this.latitude,
            this.longitude,
            item.latitude,
            item.longitude
          )
        };
      });
      this.lots = withDistance;
    },
    refreshLocation() {
      this.acquireLocation().then(() => {
        this.loadParkingLots();
      });
    },
    refreshData() {
      this.refresherTriggered = true;
      setTimeout(() => {
        this.loadParkingLots();
        this.refresherTriggered = false;
        common_vendor.index.stopPullDownRefresh();
      }, 800);
    },
    handlePulling() {
    },
    handleRefresh() {
      this.refreshData();
    },
    handleRestore() {
      this.refresherTriggered = false;
    },
    handleSearch(value) {
      this.keyword = value;
    },
    handleSearchClear() {
      this.keyword = "";
    },
    toggleSort() {
      if (this.sortType === "distance") {
        this.sortType = "price";
      } else if (this.sortType === "price") {
        this.sortType = "quota";
      } else {
        this.sortType = "distance";
      }
    },
    getSortText() {
      if (this.sortType === "distance") {
        return `距离${this.sortAsc ? "最近" : "最远"}`;
      } else if (this.sortType === "price") {
        return `价格${this.sortAsc ? "最低" : "最高"}`;
      } else if (this.sortType === "quota") {
        return `车位${this.sortAsc ? "最少" : "最多"}`;
      }
      return "";
    },
    applyFilters() {
      this.showFilterPopup = false;
      this.sortAsc = true;
    },
    resetFilters() {
      this.filter = {
        businessHours: "all",
        priceRange: "all",
        reservationDays: "all"
      };
      this.keyword = "";
      this.sortType = "distance";
      this.sortAsc = true;
    },
    formatDistance(distance) {
      if (!distance || distance <= 0) {
        return "未知距离";
      }
      if (distance < 1) {
        return `${Math.round(distance * 1e3)} 米`;
      }
      return `${distance.toFixed(1)} 公里`;
    },
    goLotDetail(lotId) {
      common_vendor.index.navigateTo({
        url: `/pages/parking/detail?id=${lotId}`
      });
    },
    goReserve(lotId) {
      common_vendor.index.navigateTo({
        url: `/pages/reserve/form?lotId=${lotId}`
      });
    },
    chooseLocation() {
      common_vendor.index.showToast({
        title: "选择位置功能暂未开放",
        icon: "none"
      });
    },
    mockDetectCity() {
      return "广州市";
    },
    calculateDistance(lat1, lng1, lat2, lng2) {
      if (!lat1 || !lng1 || !lat2 || !lng2) {
        return 0;
      }
      const radLat1 = lat1 * Math.PI / 180;
      const radLat2 = lat2 * Math.PI / 180;
      const a = radLat1 - radLat2;
      const b = (lng1 - lng2) * Math.PI / 180;
      const s = 2 * Math.asin(
        Math.sqrt(
          Math.sin(a / 2) * Math.sin(a / 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(b / 2) * Math.sin(b / 2)
        )
      );
      return s * 6378.137;
    }
  }
};
if (!Array) {
  const _component_u_icon = common_vendor.resolveComponent("u-icon");
  const _component_u_skeleton = common_vendor.resolveComponent("u-skeleton");
  const _component_u_empty = common_vendor.resolveComponent("u-empty");
  const _component_u_button = common_vendor.resolveComponent("u-button");
  const _component_MapView = common_vendor.resolveComponent("MapView");
  (_component_u_icon + _component_u_skeleton + _component_u_empty + _component_u_button + _component_MapView)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.loading
  }, !$data.loading ? {
    b: common_vendor.p({
      name: "volume",
      size: "32",
      color: "#FFB400"
    })
  } : {}, {
    c: $data.loading
  }, $data.loading ? {
    d: common_vendor.f(3, (i, k0, i0) => {
      return {
        a: "4978fed5-1-" + i0,
        b: i
      };
    }),
    e: common_vendor.p({
      rows: "3",
      loading: true,
      animate: true
    })
  } : $data.viewMode === "list" ? common_vendor.e({
    g: $options.filteredLots.length === 0
  }, $options.filteredLots.length === 0 ? {
    h: common_vendor.p({
      mode: "list",
      text: "暂无符合条件的停车场"
    })
  } : {}, {
    i: common_vendor.f($options.filteredLots, (lot, k0, i0) => {
      return {
        a: common_vendor.t(lot.name),
        b: common_vendor.t($options.formatDistance(lot.distance)),
        c: lot.latitude,
        d: lot.longitude,
        e: [{
          id: lot.id,
          latitude: lot.latitude,
          longitude: lot.longitude,
          width: 26,
          height: 26
        }],
        f: common_vendor.t(lot.latitude.toFixed(4)),
        g: common_vendor.t(lot.longitude.toFixed(4)),
        h: common_vendor.t(lot.address),
        i: common_vendor.o(($event) => $options.goLotDetail(lot.id), lot.id),
        j: common_vendor.t(lot.businessHours),
        k: common_vendor.t(lot.availableQuota),
        l: common_vendor.o(($event) => $options.goReserve(lot.id), lot.id),
        m: "4978fed5-3-" + i0,
        n: lot.id
      };
    }),
    j: common_vendor.p({
      type: "primary",
      size: "default",
      ["custom-style"]: {
        width: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "50rpx",
        height: "88rpx",
        fontSize: "32rpx",
        fontWeight: "600"
      }
    }),
    k: $data.refresherTriggered,
    l: common_vendor.o((...args) => $options.handlePulling && $options.handlePulling(...args)),
    m: common_vendor.o((...args) => $options.handleRefresh && $options.handleRefresh(...args)),
    n: common_vendor.o((...args) => $options.handleRestore && $options.handleRestore(...args))
  }) : {}, {
    f: $data.viewMode === "list",
    o: $data.viewMode === "map"
  }, $data.viewMode === "map" ? {
    p: common_vendor.p({
      latitude: $data.latitude || 23.12911,
      longitude: $data.longitude || 113.264385,
      ["filtered-lots"]: $options.filteredLots
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map
