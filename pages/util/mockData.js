import { getStorage, setStorage, removeStorage } from '@/pages/common/storage'

const DEFAULT_PARKING_LOTS = [
  {
    id: 'lot-wenzhou-airport',
    name: '温州机场宏韵停车场',
    address: '浙江省温州市龙湾区海滨街道蟾钟村丰蓝路空港国际对面',
    latitude: 27.915,
    longitude: 120.845,
    distance: 0,
    availableQuota: 50,
    totalCapacity: 100,
    depositAmount: 6,
    pricePerHour: 20,
    allowedReservationDays: 30,
    businessHours: '全天 24 小时开放',
    description: '温州机场专用停车场，提供预约服务，停一天仅需20元'
  },
  {
    id: 'lot-central-plaza',
    name: '中心广场停车场',
    address: '广州市天河区中心广场路 88 号',
    latitude: 23.12911,
    longitude: 113.264385,
    distance: 0,
    availableQuota: 18,
    totalCapacity: 120,
    depositAmount: 20,
    pricePerHour: 6,
    allowedReservationDays: 3,
    businessHours: '全天 24 小时开放',
    description: '临近商圈的地面停车场，支持扫码入场与车牌识别'
  },
  {
    id: 'lot-metro-hub',
    name: '地铁枢纽地下停车场',
    address: '广州市越秀区枢纽大道 66 号',
    latitude: 23.135308,
    longitude: 113.270793,
    distance: 0,
    availableQuota: 9,
    totalCapacity: 260,
    depositAmount: 15,
    pricePerHour: 5,
    allowedReservationDays: 5,
    businessHours: '06:00 - 23:00',
    description: '毗邻地铁站的地下停车库，支持线上预约与快速入场'
  },
  {
    id: 'lot-tech-park',
    name: '科技园智慧停车场',
    address: '广州市番禺区科技大道 18 号',
    latitude: 23.069572,
    longitude: 113.397146,
    distance: 0,
    availableQuota: 25,
    totalCapacity: 200,
    depositAmount: 10,
    pricePerHour: 4,
    allowedReservationDays: 7,
    businessHours: '全天 24 小时开放',
    description: '园区内专属停车场，配备新能源充电桩与导航指引'
  }
]

const DEFAULT_PAYMENT_RECORDS = [
  {
    id: 'PAY20230501001',
    title: '中心广场停车场预约',
    amount: '20.00',
    paymentTime: '2023-05-01 09:15:30',
    paymentMethod: '微信支付',
    transactionId: 'wx202305010915301234567890',
    status: 'success', // success: 支付成功, pending: 支付中, failed: 支付失败, refunded: 已退款
    canRefund: true,
    reservationId: 'RES20230501001',
    createdAt: '2023-05-01T09:15:30.000Z'
  },
  {
    id: 'PAY20230502001',
    title: '地铁枢纽地下停车场预约',
    amount: '15.00',
    paymentTime: '2023-05-02 14:22:45',
    paymentMethod: '支付宝',
    transactionId: 'al202305020915301234567890',
    status: 'success',
    canRefund: false,
    reservationId: 'RES20230502001',
    createdAt: '2023-05-02T14:22:45.000Z'
  },
  {
    id: 'PAY20230503001',
    title: '科技园智慧停车场预约',
    amount: '10.00',
    paymentTime: '2023-05-03 18:45:12',
    paymentMethod: '微信支付',
    transactionId: 'wx202305030915301234567890',
    status: 'refunded',
    canRefund: false,
    reservationId: 'RES20230503001',
    createdAt: '2023-05-03T18:45:12.000Z'
  }
]

const STORAGE_KEYS = {
  parkingLots: 'mock.parkingLots',
  reservations: 'mock.reservations',
  paymentRecords: 'mock.paymentRecords'
}

function cloneDeep(data) {
  return JSON.parse(JSON.stringify(data))
}

function ensureParkingLotsInitialized() {
  const stored = getStorage(STORAGE_KEYS.parkingLots)
  if (stored && Array.isArray(stored) && stored.length) {
    return stored
  }
  setStorage(STORAGE_KEYS.parkingLots, cloneDeep(DEFAULT_PARKING_LOTS))
  return cloneDeep(DEFAULT_PARKING_LOTS)
}

function ensurePaymentRecordsInitialized() {
  const stored = getStorage(STORAGE_KEYS.paymentRecords)
  if (stored && Array.isArray(stored) && stored.length) {
    return stored
  }
  setStorage(STORAGE_KEYS.paymentRecords, cloneDeep(DEFAULT_PAYMENT_RECORDS))
  return cloneDeep(DEFAULT_PAYMENT_RECORDS)
}

export function getParkingLots() {
  return cloneDeep(ensureParkingLotsInitialized())
}

export function getParkingLotById(lotId) {
  const list = ensureParkingLotsInitialized()
  return cloneDeep(list.find((item) => item.id === lotId) || null)
}

export function updateParkingLots(nextList) {
  setStorage(STORAGE_KEYS.parkingLots, cloneDeep(nextList))
}

export function adjustParkingLotQuota(lotId, delta) {
  const list = ensureParkingLotsInitialized().map((item) => {
    if (item.id !== lotId) {
      return item
    }
    const nextAvailable = Math.max(0, item.availableQuota + delta)
    return { ...item, availableQuota: nextAvailable }
  })
  updateParkingLots(list)
}

function ensureReservationsInitialized() {
  const stored = getStorage(STORAGE_KEYS.reservations, [])
  if (Array.isArray(stored)) {
    return stored
  }
  setStorage(STORAGE_KEYS.reservations, [])
  return []
}

export function getReservations() {
  return cloneDeep(ensureReservationsInitialized())
}

export function getReservationById(reservationId) {
  const reservations = ensureReservationsInitialized()
  return cloneDeep(reservations.find((item) => item.id === reservationId) || null)
}

export function saveReservation(reservation) {
  const reservations = ensureReservationsInitialized()
  const nextReservations = [cloneDeep(reservation), ...reservations]
  setStorage(STORAGE_KEYS.reservations, nextReservations)
}

export function generateReservationId() {
  return `RES${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
}

export function createReservation(reservationData) {
  const reservation = {
    id: generateReservationId(),
    lotId: reservationData.lotId,
    lotName: reservationData.lotName,
    reservationDate: reservationData.reservationDate,
    startDate: reservationData.startDate,
    endDate: reservationData.endDate,
    reservationDays: reservationData.reservationDays || 1,
    arrivalTime: reservationData.arrivalTime,
    durationHours: reservationData.durationHours,
    plateNumber: reservationData.plateNumber,
    phoneNumber: reservationData.phoneNumber,
    depositAmount: reservationData.depositAmount,
    couponAmount: reservationData.couponAmount || 0,
    status: 'pending', // pending: 待入场, active: 使用中, completed: 已完成, cancelled: 已取消
    createdAt: new Date().toISOString()
  }
  
  saveReservation(reservation)
  return reservation
}

export function updateReservationStatus(reservationId, nextStatus, updater = (data) => data) {
  const reservations = ensureReservationsInitialized()
  const nextReservations = reservations.map((item) => {
    if (item.id !== reservationId) {
      return item
    }
    const nextReservation = { ...item, status: nextStatus }
    return updater(nextReservation)
  })
  setStorage(STORAGE_KEYS.reservations, nextReservations)
  return cloneDeep(nextReservations.find((item) => item.id === reservationId) || null)
}

export function removeReservation(reservationId) {
  const reservations = ensureReservationsInitialized()
  const nextReservations = reservations.filter((item) => item.id !== reservationId)
  setStorage(STORAGE_KEYS.reservations, nextReservations)
  return nextReservations
}

// 支付记录相关方法
export function getPaymentRecords() {
  return cloneDeep(ensurePaymentRecordsInitialized())
}

// 计算停车费优惠
export function calculateParkingFeeDiscount(amount) {
  // 停车费用满160元优惠5元，满200元优惠10元
  if (amount >= 200) {
    return 10
  } else if (amount >= 160) {
    return 5
  }
  return 0
}

// 计算实际需要支付的停车费
export function calculateActualParkingFee(baseAmount) {
  const discount = calculateParkingFeeDiscount(baseAmount)
  return Math.max(0, baseAmount - discount)
}

export function getPaymentRecordById(paymentId) {
  const records = ensurePaymentRecordsInitialized()
  return cloneDeep(records.find((item) => item.id === paymentId) || null)
}

export function createPaymentRecord(paymentData) {
  const payment = {
    id: `PAY${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    title: paymentData.title,
    amount: paymentData.amount,
    paymentTime: new Date().toLocaleString(),
    paymentMethod: paymentData.paymentMethod || '微信支付',
    transactionId: `tx${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    status: 'success',
    canRefund: paymentData.canRefund !== false,
    reservationId: paymentData.reservationId,
    createdAt: new Date().toISOString()
  }
  
  const records = ensurePaymentRecordsInitialized()
  const nextRecords = [cloneDeep(payment), ...records]
  setStorage(STORAGE_KEYS.paymentRecords, nextRecords)
  
  return payment
}

export function requestRefund(paymentId) {
  const records = ensurePaymentRecordsInitialized()
  const paymentRecord = records.find((item) => item.id === paymentId)
  
  if (!paymentRecord || paymentRecord.status !== 'success' || !paymentRecord.canRefund) {
    return false
  }
  
  const nextRecords = records.map((item) => {
    if (item.id !== paymentId) {
      return item
    }
    return { ...item, status: 'refunded', canRefund: false }
  })
  
  setStorage(STORAGE_KEYS.paymentRecords, nextRecords)
  return true
}

export function createParkingLot(lotData) {
  const list = ensureParkingLotsInitialized()
  const newLot = {
    id: `lot-${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    name: lotData.name,
    address: lotData.address,
    latitude: lotData.latitude || 23.12911,
    longitude: lotData.longitude || 113.264385,
    distance: 0,
    availableQuota: lotData.availableQuota || 0,
    totalCapacity: lotData.totalCapacity || 0,
    depositAmount: lotData.depositAmount || 0,
    pricePerHour: lotData.pricePerHour || 0,
    allowedReservationDays: lotData.allowedReservationDays || 7,
    businessHours: lotData.businessHours || '全天 24 小时开放',
    description: lotData.description || '',
    status: lotData.status || 'active'
  }
  const nextList = [newLot, ...list]
  updateParkingLots(nextList)
  return newLot
}

export function deleteParkingLot(lotId) {
  const list = ensureParkingLotsInitialized()
  const nextList = list.filter(item => item.id !== lotId)
  updateParkingLots(nextList)
  return nextList.length < list.length
}

export function resetMockData() {
  removeStorage(STORAGE_KEYS.parkingLots)
  removeStorage(STORAGE_KEYS.reservations)
  removeStorage(STORAGE_KEYS.paymentRecords)
}

/**
 * 发起退款申请
 * @param {string} paymentId - 支付记录ID
 * @returns {Object|null} 退款申请结果
 */
export function initiateRefund(paymentId) {
  const records = getPaymentRecords()
  const payment = records.find(p => p.id === paymentId)
  
  if (!payment || payment.status !== 'success' || !payment.canRefund) {
    return null
  }
  
  const nextRecords = records.map((item) => {
    if (item.id !== paymentId) {
      return item
    }
    return {
      ...item,
      status: 'refunding',
      refundStatus: 'pending',
      refundInitiatedAt: new Date().toISOString()
    }
  })
  
  setStorage(STORAGE_KEYS.paymentRecords, nextRecords)
  return nextRecords.find(p => p.id === paymentId)
}

/**
 * 处理退款（管理员操作）
 * @param {string} refundId - 退款记录ID
 * @returns {Object|null} 处理结果
 */
export function processRefund(refundId) {
  const records = getPaymentRecords()
  const payment = records.find(p => p.id === refundId)
  
  if (!payment || payment.status !== 'refunding') {
    return null
  }
  
  const nextRecords = records.map((item) => {
    if (item.id !== refundId) {
      return item
    }
    return {
      ...item,
      status: 'refunded',
      refundStatus: 'completed',
      canRefund: false,
      refundCompletedAt: new Date().toISOString()
    }
  })
  
  setStorage(STORAGE_KEYS.paymentRecords, nextRecords)
  return nextRecords.find(p => p.id === refundId)
}
