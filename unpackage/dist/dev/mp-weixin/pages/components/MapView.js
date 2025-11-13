"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "MapView",
  props: {
    latitude: {
      type: Number,
      default: 23.1291
    },
    longitude: {
      type: Number,
      default: 113.2644
    },
    filteredLots: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedLot: null
    };
  },
  computed: {
    mapMarkers() {
      return this.filteredLots.map((lot) => {
        return {
          id: lot.id,
          latitude: lot.latitude,
          longitude: lot.longitude,
          width: 30,
          height: 30,
          iconPath: "https://picsum.photos/seed/marker/30/30.jpg",
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
  methods: {
    onMarkerTap(e) {
      const markerId = e.detail.markerId;
      const lot = this.filteredLots.find((item) => item.id === markerId);
      if (lot) {
        this.selectedLot = lot;
      }
    },
    onCalloutTap(e) {
      const markerId = e.detail.markerId;
      const lot = this.filteredLots.find((item) => item.id === markerId);
      if (lot) {
        this.goLotDetail(lot.id);
      }
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
    formatDistance(distance) {
      if (!distance || distance <= 0) {
        return "未知距离";
      }
      if (distance < 1) {
        return `${Math.round(distance * 1e3)} 米`;
      }
      return `${distance.toFixed(1)} 公里`;
    }
  }
};
if (!Array) {
  const _component_u_icon = common_vendor.resolveComponent("u-icon");
  const _component_u_button = common_vendor.resolveComponent("u-button");
  (_component_u_icon + _component_u_button)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.latitude,
    b: $props.longitude,
    c: $options.mapMarkers,
    d: common_vendor.o((...args) => $options.onMarkerTap && $options.onMarkerTap(...args)),
    e: common_vendor.o((...args) => $options.onCalloutTap && $options.onCalloutTap(...args)),
    f: $data.selectedLot
  }, $data.selectedLot ? {
    g: common_vendor.t($data.selectedLot.name),
    h: common_vendor.p({
      name: "close",
      size: "24",
      color: "#7a8499"
    }),
    i: common_vendor.o(($event) => $data.selectedLot = null),
    j: common_vendor.t($data.selectedLot.address),
    k: common_vendor.t($options.formatDistance($data.selectedLot.distance)),
    l: common_vendor.t($data.selectedLot.availableQuota),
    m: common_vendor.t($data.selectedLot.businessHours),
    n: common_vendor.t($data.selectedLot.pricePerHour),
    o: common_vendor.o(($event) => $options.goReserve($data.selectedLot.id)),
    p: common_vendor.p({
      type: "primary",
      size: "small"
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-14eb4635"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/components/MapView.js.map
