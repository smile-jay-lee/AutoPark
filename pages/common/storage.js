export function getStorage(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(key)
    if (value === undefined || value === null || value === '') {
      return defaultValue
    }
    return value
  } catch (error) {
    console.warn('读取本地存储失败', key, error)
    return defaultValue
  }
}

export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (error) {
    console.warn('写入本地存储失败', key, error)
  }
}

export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
  } catch (error) {
    console.warn('删除本地存储失败', key, error)
  }
}
