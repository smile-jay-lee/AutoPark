<template>
  <view class="map-container">
    <map
      id="map"
      class="map"
      :latitude="latitude"
      :longitude="longitude"
      :markers="mapMarkers"
      :scale="14"
      @markertap="onMarkerTap"
      @callouttap="onCalloutTap"
    ></map>
    
    <!-- 选中停车场信息卡片 -->
    <view v-if="selectedLot" class="map-bottom-card">
      <view class="map-card-header">
        <text class="map-lot-name">{{ selectedLot.name }}</text>
        <view class="map-close" @click="selectedLot = null">
          <u-icon name="close" size="24" color="#7a8499"></u-icon>
        </view>
      </view>
      
      <view class="map-card-body">
        <view class="map-info-row">
          <text class="map-info-label">地址</text>
          <text class="map-info-value">{{ selectedLot.address }}</text>
        </view>
        <view class="map-info-row">
          <text class="map-info-label">距离</text>
          <text class="map-info-value">{{ formatDistance(selectedLot.distance) }}</text>
        </view>
        <view class="map-info-row">
          <text class="map-info-label">可预约</text>
          <text class="map-info-value">{{ selectedLot.availableQuota }} 个车位</text>
        </view>
        <view class="map-info-row">
          <text class="map-info-label">营业时间</text>
          <text class="map-info-value">{{ selectedLot.businessHours }}</text>
        </view>
      </view>
      
      <view class="map-card-footer">
        <view class="map-price">
          <text class="map-price-highlight">¥{{ selectedLot.pricePerHour }}</text>
          <text class="map-price-text">/小时</text>
        </view>
        <u-button
          type="primary"
          size="small"
          @click="goReserve(selectedLot.id)"
        >立即预约</u-button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MapView',
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
    }
  },
  computed: {
    mapMarkers() {
      return this.filteredLots.map(lot => {
        return {
          id: lot.id,
          latitude: lot.latitude,
          longitude: lot.longitude,
          width: 30,
          height: 30,
          iconPath: 'https://picsum.photos/seed/marker/30/30.jpg',
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
  methods: {
    onMarkerTap(e) {
      const markerId = e.detail.markerId
      const lot = this.filteredLots.find(item => item.id === markerId)
      if (lot) {
        this.selectedLot = lot
      }
    },
    onCalloutTap(e) {
      const markerId = e.detail.markerId
      const lot = this.filteredLots.find(item => item.id === markerId)
      if (lot) {
        this.goLotDetail(lot.id)
      }
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
    formatDistance(distance) {
      if (!distance || distance <= 0) {
        return '未知距离'
      }
      if (distance < 1) {
        return `${Math.round(distance * 1000)} 米`
      }
      return `${distance.toFixed(1)} 公里`
    }
  }
}
</script>

<style lang="scss" scoped>
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
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.map-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.map-lot-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
}

.map-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f3fb;
}

.map-card-body {
  margin-bottom: 24rpx;
}

.map-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.map-info-label {
  font-size: 26rpx;
  color: #7a8499;
  width: 120rpx;
}

.map-info-value {
  font-size: 26rpx;
  color: #111;
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
  font-size: 34rpx;
  color: #ffb400;
  font-weight: 600;
}

.map-price-text {
  font-size: 24rpx;
  color: #7a8499;
  margin-left: 6rpx;
}
</style>