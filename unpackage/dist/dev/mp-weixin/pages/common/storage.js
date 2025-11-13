"use strict";
const common_vendor = require("../../common/vendor.js");
function getStorage(key, defaultValue = null) {
  try {
    const value = common_vendor.index.getStorageSync(key);
    if (value === void 0 || value === null || value === "") {
      return defaultValue;
    }
    return value;
  } catch (error) {
    common_vendor.index.__f__("warn", "at pages/common/storage.js:9", "读取本地存储失败", key, error);
    return defaultValue;
  }
}
function setStorage(key, value) {
  try {
    common_vendor.index.setStorageSync(key, value);
  } catch (error) {
    common_vendor.index.__f__("warn", "at pages/common/storage.js:18", "写入本地存储失败", key, error);
  }
}
exports.getStorage = getStorage;
exports.setStorage = setStorage;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/common/storage.js.map
