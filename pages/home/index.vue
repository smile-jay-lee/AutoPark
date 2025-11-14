<template>
  <view class="page">
    <!-- 公告栏 - 优化样式 -->
    <view class="announcement" v-if="!loading">
      <u-icon name="volume" size="32" color="#FFB400"></u-icon>
      <view class="announcement-content">
        <text class="announcement-text">收费说明：按照自然日计费，日费示例 ¥20/日；定金（预约）规则：7 天以内定金 ¥5，7 天及以上定金 ¥10。出场扫码支付自动抬杆。</text>
      </view>
    </view>

    <!-- 加载骨架屏 -->
    <view v-if="loading" class="skeleton-wrapper">
      <view class="skeleton-card" v-for="i in 3" :key="i">
        <u-skeleton rows="3" :loading="true" :animate="true"></u-skeleton>
      </view>
    </view>

    <!-- 列表视图 -->
    <scroll-view
      v-else-if="viewMode === 'list'"
      class="lot-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refresherTriggered"
      @refresherpulling="handlePulling"
      @refresherrefresh="handleRefresh"
      @refresherrestore="handleRestore"
    >
      <view v-if="filteredLots.length === 0" class="empty-state">
        <u-empty mode="list" text="暂无符合条件的停车场"></u-empty>
      </view>
      <view
        v-for="lot in filteredLots"
        :key="lot.id"
        class="lot-card animate-fade-in"
      >
        <!-- 第1行：停车场名称(居中) -->
        <view class="card-row card-title-row">
          <text class="lot-name">{{ lot.name }}</text>
        </view>
        
        <!-- 第1.5行：距离标签(居中) -->
        <view class="card-row distance-row">
          <view class="distance-badge">
            <text>{{ formatDistance(lot.distance) }}</text>
          </view>
        </view>

        <!-- 第2行：地图缩略图（长方形，显示定位数据） -->
        <view class="card-row map-thumbnail" @click="goLotDetail(lot.id)">
          <map
            class="mini-map"
            :latitude="lot.latitude"
            :longitude="lot.longitude"
            :markers="[{ id: lot.id, latitude: lot.latitude, longitude: lot.longitude, width: 26, height: 26 }]"
            :scale="14"
            :show-location="false"
          ></map>
          <view class="map-overlay">
            <text class="coord-text">📍 {{ lot.latitude.toFixed(4) }}, {{ lot.longitude.toFixed(4) }}</text>
            <text class="address-text">{{ lot.address }}</text>
          </view>
        </view>

        <!-- 第3行：营业时间(垂直布局) -->
        <view class="card-row business-hours-row">
          <view class="icon-row">
            <text class="icon">🕐</text>
            <text class="label">营业时间</text>
          </view>
          <text class="hours-text">{{ lot.businessHours }}</text>
        </view>

        <!-- 第4行：剩余车位(垂直居中布局) -->
        <view class="card-row quota-row">
          <view class="icon-row">
            <text class="icon">🅿️</text>
            <text class="label">剩余车位</text>
          </view>
          <view class="quota-badge">
            <text class="quota-num">{{ lot.availableQuota }}个</text>
          </view>
        </view>

        <!-- 第5行：预约定金(垂直布局) -->
        <view class="card-row deposit-row">
          <text class="deposit-label">预约定金</text>
          <text class="deposit-value">7天内¥5 / 7天以上¥10</text>
        </view>

        <!-- 第6行：预约按钮 -->
        <view class="card-row action-row">
          <u-button
            type="primary"
            size="default"
            :custom-style="{ 
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              border: 'none',
              borderRadius: '50rpx',
              height: '88rpx',
              fontSize: '32rpx',
              fontWeight: '600'
            }"
            @click.stop="goReserve(lot.id)"
          >
            立即预约
          </u-button>
        </view>
      </view>
    </scroll-view>
    
    <!-- 地图视图 -->
    <MapView
      v-if="viewMode === 'map'"
      :latitude="latitude || 23.12911"
      :longitude="longitude || 113.264385"
      :filtered-lots="filteredLots"
    ></MapView>
  </view>
</template>

<script>
import { getParkingLots } from '@/pages/util/mockData'
import MapView from '@/pages/components/MapView.vue'

export default {
  components: {
    MapView
  },
  data() {
    return {
      loading: true,
      locationReady: false,
      currentCity: '定位中',
      latitude: 0,
      longitude: 0,
      lots: [],
      refresherTriggered: false,
      // 新增数据
      viewMode: 'list', // list, map
      selectedLot: null
    }
  },
  computed: {
    displayLocation() {
      return this.locationReady ? this.currentCity : '定位中...'
    },
    filteredLots() {
      // 只显示温州机场宏韵停车场
      return this.lots.filter(lot => lot.id === 'lot-wenzhou-airport')
    },
    totalAvailable() {
      return this.filteredLots.reduce((sum, item) => sum + item.availableQuota, 0)
    },
    totalLots() {
      return this.filteredLots.length
    },
    // 地图标记点
    mapMarkers() {
      return this.filteredLots.map(lot => {
        return {
          id: lot.id,
          latitude: lot.latitude,
          longitude: lot.longitude,
          width: 30,
          height: 30,
          // iconPath: '/static/coolc/parking-marker.png',
          callout: {
            content: lot.name,
            color: '#333',
            fontSize: 12,
            borderRadius: 4,
            bgColor: '#fff',
            padding: 5,
            display: 'ALWAYS'
          }
        }
      })
    }
  },
  onLoad() {
    this.initialize()
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    async initialize() {
      this.loading = true
      await this.acquireLocation()
      this.loadParkingLots()
      this.$nextTick(() => {
        this.locationReady = true
        setTimeout(() => {
          this.loading = false
        }, 500)
      })
    },
    async acquireLocation() {
      return new Promise((resolve) => {
        uni.getLocation({
          type: 'gcj02',
          success: (res) => {
            this.latitude = res.latitude
            this.longitude = res.longitude
            this.currentCity = this.mockDetectCity(res.latitude, res.longitude)
            resolve()
          },
          fail: () => {
            this.currentCity = '位置授权失败'
            uni.showToast({
              title: '无法获取当前位置',
              icon: 'none'
            })
            resolve()
          }
        })
      })
    },
    loadParkingLots() {
      const lots = getParkingLots()
      const withDistance = lots.map((item) => {
        return {
          ...item,
          distance: this.calculateDistance(
            this.latitude,
            this.longitude,
            item.latitude,
            item.longitude
          )
        }
      })
      this.lots = withDistance
    },
    refreshLocation() {
      this.acquireLocation().then(() => {
        this.loadParkingLots()
      })
    },
    refreshData() {
      this.refresherTriggered = true
      setTimeout(() => {
        this.loadParkingLots()
        this.refresherTriggered = false
        uni.stopPullDownRefresh()
      }, 800)
    },
    handlePulling() {},
    handleRefresh() {
      this.refreshData()
    },
    handleRestore() {
      this.refresherTriggered = false
    },
    handleSearch(value) {
      this.keyword = value
    },
    handleSearchClear() {
      this.keyword = ''
    },
    toggleSort() {
      // 循环切换排序类型：距离 -> 价格 -> 可预约数量
      if (this.sortType === 'distance') {
        this.sortType = 'price'
      } else if (this.sortType === 'price') {
        this.sortType = 'quota'
      } else {
        this.sortType = 'distance'
      }
    },
    getSortText() {
      if (this.sortType === 'distance') {
        return `距离${this.sortAsc ? '最近' : '最远'}`
      } else if (this.sortType === 'price') {
        return `价格${this.sortAsc ? '最低' : '最高'}`
      } else if (this.sortType === 'quota') {
        return `车位${this.sortAsc ? '最少' : '最多'}`
      }
      return ''
    },
    applyFilters() {
      this.showFilterPopup = false
      // 应用筛选条件后，重置排序为升序
      this.sortAsc = true
    },
    resetFilters() {
      this.filter = {
        businessHours: 'all',
        priceRange: 'all',
        reservationDays: 'all'
      }
      this.keyword = ''
      this.sortType = 'distance'
      this.sortAsc = true
    },
    formatDistance(distance) {
      if (!distance || distance <= 0) {
        return '未知距离'
      }
      if (distance < 1) {
        return `${Math.round(distance * 1000)} 米`
      }
      return `${distance.toFixed(1)} 公里`
    },
    goLotDetail(lotId) {
      uni.navigateTo({
        url: `/pages/parking/detail?id=${lotId}`
      })
    },
    goReserve(lotId) {
      uni.navigateTo({
        url: `/pages/reserve/form?lotId=${lotId}`
      })
    },
    chooseLocation() {
      uni.showToast({
        title: '选择位置功能暂未开放',
        icon: 'none'
      })
    },
    mockDetectCity() {
      return '广州市'
    },
    calculateDistance(lat1, lng1, lat2, lng2) {
      if (!lat1 || !lng1 || !lat2 || !lng2) {
        return 0
      }
      const radLat1 = (lat1 * Math.PI) / 180
      const radLat2 = (lat2 * Math.PI) / 180
      const a = radLat1 - radLat2
      const b = ((lng1 - lng2) * Math.PI) / 180
      const s =
        2 *
        Math.asin(
          Math.sqrt(
            Math.sin(a / 2) * Math.sin(a / 2) +
              Math.cos(radLat1) *
                Math.cos(radLat2) *
                Math.sin(b / 2) *
                Math.sin(b / 2)
          )
        )
      return s * 6378.137
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding-bottom: 40rpx;
}

.hero {
  padding: 36rpx 30rpx 24rpx 30rpx;
  background: linear-gradient(180deg, var(--primary-light) 0%, var(--bg-secondary) 100%);
}

/* 布局统一：在不改模板结构的前提下，限制内容最大宽度并居中 */
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.announcement {
  max-width: 720rpx;
  margin: 24rpx auto;
}

.skeleton-wrapper {
  max-width: 720rpx;
  margin: 0 auto;
  padding: 24rpx;
}

.lot-list {
  margin-top: var(--spacing-md);
  height: calc(100vh - 360rpx);
  padding: 0;
  width: 100%;
}

.location-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.location-info {
  flex: 1;
  margin: 0 20rpx;
  display: flex;
  flex-direction: column;
}

.city {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.tip {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-top: 4rpx;
}

.search-box {
  margin-top: var(--spacing-md);
}

.summary-card {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--bg-primary);
  border-radius: var(--radius-large);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary);
  transition: transform var(--duration-normal) var(--ease-out);
  
  &:active {
    transform: scale(0.98);
  }
}

.summary-item {
  flex: 1;
  text-align: center;
}

.value {
  font-size: var(--font-xxxl);
  font-weight: 600;
  color: var(--primary-color);
}

.label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-top: 6rpx;
}

.divider {
  width: 2rpx;
  height: 60rpx;
  background: var(--border-color);
}

// 视图切换样式
.view-switch {
  display: flex;
  margin-top: var(--spacing-md);
  background: var(--bg-quaternary);
  border-radius: var(--radius-round);
  padding: 6rpx;
}

.view-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) 0;
  border-radius: var(--radius-round);
  transition: all var(--duration-normal) var(--ease-out);

  &.active {
    background: var(--bg-primary);
    box-shadow: var(--shadow-light);
  }
}

.view-text {
  font-size: var(--font-sm);
  margin-left: var(--spacing-xs);
  color: var(--text-secondary);

  .active & {
    color: var(--primary-color);
  }
}

.section-title {
  margin-top: var(--spacing-md);
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.filter-actions {
  display: flex;
  gap: var(--spacing-md);
}

.filter {
  display: flex;
  align-items: center;
  color: var(--primary-color);
  transition: transform var(--duration-fast) var(--ease-out);
  
  &:active {
    transform: scale(0.95);
  }
}

.filter-text {
  font-size: var(--font-sm);
  margin-left: 6rpx;
}

.lot-list {
  margin-top: var(--spacing-md);
  height: calc(100vh - 360rpx);
  padding: 0 var(--spacing-lg);
}

.lot-card {
  margin-top: var(--spacing-md);
  background: var(--bg-primary);
  border-radius: var(--radius-large);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-light);
  transition: all var(--duration-normal) var(--ease-out);
  
  &:hover {
    transform: translateY(-4rpx);
    box-shadow: var(--shadow-medium);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.lot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lot-name {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.distance {
  font-size: var(--font-sm);
  color: var(--primary-color);
}

.lot-body {
  display: flex;
  margin-top: var(--spacing-md);
}

.quota {
  width: 140rpx;
  text-align: center;
  border-right: 2rpx solid var(--border-light);
}

.quota-value {
  font-size: var(--font-xxxl);
  font-weight: 600;
  color: var(--primary-color);
}

.quota-label {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.lot-meta {
  flex: 1;
  padding-left: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-xs);
}

.meta-text {
  font-size: var(--font-sm);
  color: var(--text-regular);
  margin-left: var(--spacing-xs);
}

.lot-footer {
  margin-top: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  display: flex;
  align-items: center;
}

.price-highlight {
  font-size: var(--font-xl);
  color: var(--warning-color);
  font-weight: 600;
}

.price-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-left: var(--spacing-xs);
}

.empty-state {
  padding: var(--spacing-xxl) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
}

.empty-text {
  margin-top: var(--spacing-md);
  font-size: var(--font-md);
  color: var(--text-secondary);
}

.reset-btn {
  margin-top: var(--spacing-lg);
}

// 地图视图样式
.map-container {
  position: relative;
  height: calc(100vh - 360rpx);
}

.map {
  width: 100%;
  height: 100%;
}

.map-bottom-card {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-radius: var(--radius-large) var(--radius-large) 0 0;
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-medium);
}

.map-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.map-lot-name {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.map-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-quaternary);
}

.map-card-body {
  margin-bottom: var(--spacing-md);
}

.map-info-row {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.map-info-label {
  font-size: var(--font-md);
  color: var(--text-secondary);
  width: 120rpx;
}

.map-info-value {
  font-size: var(--font-md);
  color: var(--text-primary);
  flex: 1;
}

.map-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.map-price {
  display: flex;
  align-items: center;
}

.map-price-highlight {
  font-size: var(--font-xl);
  color: var(--warning-color);
  font-weight: 600;
}

.map-price-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-left: var(--spacing-xs);
}

// 公告栏样式优化
.announcement {
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #FFF9E6 0%, #FFFBE6 100%);
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 180, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16rpx;
  animation: slideInDown 0.5s ease-out;
}

.announcement-content {
  flex: 1;
  overflow: visible; /* 允许内容完全显示 */
}

.announcement-text {
  font-size: 26rpx;
  color: #8B6914;
  line-height: 1.6;
  white-space: normal; /* 允许文本换行 */
  display: block; /* 确保文本块显示 */
}

// 骨架屏样式
.skeleton-wrapper {
  padding: 32rpx;
}

.skeleton-card {
  margin-bottom: 32rpx;
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(17, 32, 64, 0.04);
}

// 重构后的卡片样式
.lot-card {
  margin: 48rpx 48rpx;
  width: calc(100% - 96rpx);
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(102,126,234,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.lot-card:active {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 24rpx rgba(102,126,234,0.12);
}

// 卡片行通用样式
.card-row {
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// 第1行：标题行(居中)
.card-title-row {
  text-align: center;
  padding: 0 0 12rpx 0;
}

.lot-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
}

// 第1.5行：距离标签行(居中)
.distance-row {
  display: flex;
  justify-content: center;
  padding: 0;
  margin-bottom: 16rpx;
}

.distance-badge {
  background: linear-gradient(135deg, #32caec 0%, #2db3d8 100%);
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

// 第2行：地图缩略图
.map-thumbnail {
  position: relative;
  padding: 0;
  margin: 0 -24rpx 16rpx -24rpx;
  height: 180rpx;
  background: #f5f7fa;
}

.mini-map {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
  padding: 16rpx 20rpx 12rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.coord-text {
  font-size: 20rpx;
  color: rgba(255,255,255,0.95);
  font-family: monospace;
}

.address-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

// 第3行：营业时间行
.business-hours-row {
  padding: 0;
  text-align: center;
}

.icon-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.icon {
  font-size: 32rpx;
}

.label {
  font-size: 26rpx;
  color: #7A8499;
}

.hours-text {
  display: block;
  font-size: 32rpx;
  color: #5B8FF9;
  font-weight: 600;
}

// 第4行：剩余车位行
.quota-row {
  padding: 0;
  text-align: center;
}

.quota-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 12rpx;
  background: #F5F5F5;
  color: #000;
  min-width: 160rpx;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  border: 2rpx solid #E0E0E0;
}

.quota-num {
  font-size: 40rpx;
  font-weight: 700;
  color: #000;
}

// 第5行：预约定金行
.deposit-row {
  padding: 0;
  text-align: center;
}

.deposit-label {
  display: block;
  font-size: 26rpx;
  color: #7A8499;
  margin-bottom: 8rpx;
}

.deposit-value {
  display: block;
  font-size: 30rpx;
  color: #5B8FF9;
  font-weight: 600;
}

// 第6行：按钮行
.action-row {
  padding: 0;
  margin-top: 20rpx;
}

// 动画效果
@keyframes slideInDown {
  from {
    transform: translateY(-20rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes popIn {
  from { transform: scale(0.88); opacity: 0; }
  60% { transform: scale(1.06); opacity: 1; }
  to { transform: scale(1); }
}

.quota-badge:active {
  transform: scale(0.96);
}

.animate-fade-in {
  animation: slideInUp 0.4s ease-out;
}

.lot-card:nth-child(1) { animation-delay: 0.05s; }
.lot-card:nth-child(2) { animation-delay: 0.1s; }
.lot-card:nth-child(3) { animation-delay: 0.15s; }
.lot-card:nth-child(4) { animation-delay: 0.2s; }
.lot-card:nth-child(5) { animation-delay: 0.25s; }

// 筛选弹窗样式
.filter-popup {
  padding: var(--spacing-xl) var(--spacing-lg);
  background: var(--bg-primary);
  border-radius: var(--radius-large) var(--radius-large) 0 0;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.popup-title {
  font-size: var(--font-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.filter-section {
  margin-bottom: var(--spacing-lg);
}

.filter-section-title {
  font-size: var(--font-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.popup-footer {
  padding-top: var(--spacing-md);
}

.confirm-btn {
  width: 100%;
}

// 动画效果
.lot-card {
  animation: slideInUp var(--duration-normal) var(--ease-out);
}

.lot-card:nth-child(1) { animation-delay: 0.05s; }
.lot-card:nth-child(2) { animation-delay: 0.1s; }
.lot-card:nth-child(3) { animation-delay: 0.15s; }
.lot-card:nth-child(4) { animation-delay: 0.2s; }
.lot-card:nth-child(5) { animation-delay: 0.25s; }
</style>
