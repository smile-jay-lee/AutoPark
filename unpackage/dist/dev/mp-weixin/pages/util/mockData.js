"use strict";
const pages_common_storage = require("../common/storage.js");
const DEFAULT_PARKING_LOTS = [
  {
    id: "lot-wenzhou-airport",
    name: "温州机场宏韵停车场",
    address: "浙江省温州市龙湾区海滨街道蟾钟村丰蓝路空港国际对面",
    latitude: 27.915,
    longitude: 120.845,
    distance: 0,
    availableQuota: 50,
    totalCapacity: 100,
    depositAmount: 6,
    pricePerHour: 20,
    allowedReservationDays: 30,
    businessHours: "全天 24 小时开放",
    description: "温州机场专用停车场，提供预约服务，停一天仅需20元"
  },
  {
    id: "lot-central-plaza",
    name: "中心广场停车场",
    address: "广州市天河区中心广场路 88 号",
    latitude: 23.12911,
    longitude: 113.264385,
    distance: 0,
    availableQuota: 18,
    totalCapacity: 120,
    depositAmount: 20,
    pricePerHour: 6,
    allowedReservationDays: 3,
    businessHours: "全天 24 小时开放",
    description: "临近商圈的地面停车场，支持扫码入场与车牌识别"
  },
  {
    id: "lot-metro-hub",
    name: "地铁枢纽地下停车场",
    address: "广州市越秀区枢纽大道 66 号",
    latitude: 23.135308,
    longitude: 113.270793,
    distance: 0,
    availableQuota: 9,
    totalCapacity: 260,
    depositAmount: 15,
    pricePerHour: 5,
    allowedReservationDays: 5,
    businessHours: "06:00 - 23:00",
    description: "毗邻地铁站的地下停车库，支持线上预约与快速入场"
  },
  {
    id: "lot-tech-park",
    name: "科技园智慧停车场",
    address: "广州市番禺区科技大道 18 号",
    latitude: 23.069572,
    longitude: 113.397146,
    distance: 0,
    availableQuota: 25,
    totalCapacity: 200,
    depositAmount: 10,
    pricePerHour: 4,
    allowedReservationDays: 7,
    businessHours: "全天 24 小时开放",
    description: "园区内专属停车场，配备新能源充电桩与导航指引"
  }
];
const STORAGE_KEYS = {
  parkingLots: "mock.parkingLots",
  reservations: "mock.reservations",
  paymentRecords: "mock.paymentRecords"
};
function cloneDeep(data) {
  return JSON.parse(JSON.stringify(data));
}
function ensureParkingLotsInitialized() {
  const stored = pages_common_storage.getStorage(STORAGE_KEYS.parkingLots);
  if (stored && Array.isArray(stored) && stored.length) {
    return stored;
  }
  pages_common_storage.setStorage(STORAGE_KEYS.parkingLots, cloneDeep(DEFAULT_PARKING_LOTS));
  return cloneDeep(DEFAULT_PARKING_LOTS);
}
function getParkingLots() {
  return cloneDeep(ensureParkingLotsInitialized());
}
exports.getParkingLots = getParkingLots;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/util/mockData.js.map
