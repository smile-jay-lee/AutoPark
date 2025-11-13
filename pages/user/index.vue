<template>
  <view class="page">
    <view class="profile-card">
      <view class="avatar">
        <u-avatar v-if="isLoggedIn && userInfo.avatar" :src="userInfo.avatar" size="large"></u-avatar>
      </view>
      <view class="profile-info">
        <view class="greeting">{{ isLoggedIn ? (userInfo.name || '微信用户') : '点击登录查看信息' }}</view>
        <view class="subtext">{{ isLoggedIn ? (userInfo.phone || '') : ' ' }}</view>
      </view>
      <view class="login-btn" v-if="!isLoggedIn" @click.stop="handleLogin">
        <text>注册/登录</text>
      </view>
    </view>

    <!-- 统计数据区域 - 始终显示 -->
    <view class="stats-section">
      <view class="stats-item" @click="switchTab('reservations')">
        <view class="stats-value">{{ stats.totalReservations }}</view>
        <view class="stats-label">总预约</view>
      </view>
      <view class="stats-item" @click="switchTab('payments')">
        <view class="stats-value">{{ stats.totalSpent }}</view>
        <view class="stats-label">累计消费</view>
      </view>
      <view class="stats-item" @click="switchTab('completed')">
        <view class="stats-value">{{ stats.completedReservations }}</view>
        <view class="stats-label">已完成</view>
      </view>
    </view>

    <!-- 筛选栏 - 始终显示 -->
    <view class="filter-bar">
      <view v-for="item in tabs" :key="item.value" class="filter-item" :class="{ active: activeTab === item.value }"
        @click="switchTab(item.value)">
        {{ item.label }}
      </view>
    </view>

    <!-- 列表区域 - 始终显示 -->
    <scroll-view class="list" scroll-y>
      <!-- 预约记录视图 -->
      <view
        v-if="activeTab === 'reservations' || activeTab === 'all' || activeTab === 'confirmed' || activeTab === 'cancelled' || activeTab === 'completed'">
        <view v-if="filteredReservations.length === 0" class="empty">
          <image class="empty-image" src="/static/coolc/empty.png"></image>
          <view class="empty-text">暂无相关预约记录</view>
        </view>
        <view v-for="item in filteredReservations" :key="item.id" class="reservation-card">
          <view class="card-header">
            <view class="lot-name">{{ item.lotName }}</view>
            <view class="status" :class="'status-' + item.status">{{ statusText(item.status) }}</view>
          </view>
          <view class="card-body">
            <view class="row">
              <text class="label">预约日期</text>
              <text class="value">{{ item.reservationDate }}</text>
            </view>
            <view class="row">
              <text class="label">到达时间</text>
              <text class="value">{{ item.arrivalTime }}</text>
            </view>
            <view class="row">
              <text class="label">预约天数</text>
              <text class="value">{{ item.reservationDays }} 天</text>
            </view>
            <view class="row">
              <text class="label">预付定金</text>
              <text class="value">￥{{ item.depositAmount }}</text>
            </view>
            <view class="row" v-if="item.couponAmount && item.couponAmount > 0">
              <text class="label">优惠券</text>
              <text class="value">￥{{ item.couponAmount }}</text>
            </view>
          </view>
          <view class="card-footer">
            <u-button v-if="item.status === 'confirmed'" size="mini" plain shape="circle" color="#3D7EFF"
              @click="cancelReservation(item.id)">取消预约</u-button>
            <u-button size="mini" plain shape="circle" color="#7A8499" @click="viewDetail(item.id)">查看详情</u-button>
          </view>
        </view>
      </view>




      <!-- 支付记录视图 -->
      <view v-if="activeTab === 'payments'">
        <view v-if="paymentRecords.length === 0" class="empty">
          <image class="empty-image" src="/static/coolc/empty.png"></image>
          <view class="empty-text">暂无支付记录</view>
        </view>
        <view v-for="item in paymentRecords" :key="item.id" class="payment-card">
          <view class="card-header">
            <view class="payment-title">{{ item.title }}</view>
            <view class="amount">￥{{ item.amount }}</view>
          </view>
          <view class="card-body">
            <view class="row">
              <text class="label">支付时间</text>
              <text class="value">{{ item.paymentTime }}</text>
            </view>
            <view class="row">
              <text class="label">支付方式</text>
              <text class="value">{{ item.paymentMethod }}</text>
            </view>
            <view class="row">
              <text class="label">交易单号</text>
              <text class="value">{{ item.transactionId }}</text>
            </view>
          </view>
          <view class="card-footer">
            <view class="payment-status" :class="'payment-' + item.status">
              {{ paymentStatusText(item.status) }}
            </view>
            <u-button v-if="item.status === 'success' && item.canRefund" size="mini" plain shape="circle"
              color="#FF5A5F" @click="requestRefund(item.id)">申请退款</u-button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 设置菜单板块 - 始终显示 -->
    <view class="settings-section" @click="showSettings">
      <view class="settings-item">
        <u-icon name="setting" size="28" color="#3D7EFF"></u-icon>
        <text class="settings-text">设置菜单</text>
      </view>
      <view class="arrow-icon">
        <u-icon name="arrow-right" size="24" color="#7A8499"></u-icon>
      </view>
    </view>

    <!-- 设置弹窗 -->
    <u-popup :show="showSettingsPopup" mode="bottom" :round="true" @close="showSettingsPopup = false">
      <view class="settings-popup">
        <view class="popup-header">
          <view class="popup-title">设置</view>
          <u-icon name="close" @click="showSettingsPopup = false"></u-icon>
        </view>
        <view class="settings-list">
          <view class="settings-item" @click="goToProfile">
            <view class="settings-label">个人信息</view>
            <u-icon name="arrow-right" size="24" color="#7A8499"></u-icon>
          </view>
          <view class="settings-item" @click="goToPrivacy">
            <view class="settings-label">隐私设置</view>
            <u-icon name="arrow-right" size="24" color="#7A8499"></u-icon>
          </view>
          <view class="settings-item" @click="goToAbout">
            <view class="settings-label">关于我们</view>
            <u-icon name="arrow-right" size="24" color="#7A8499"></u-icon>
          </view>
          <view class="settings-item" @click="goToAdmin">
            <view class="settings-label">管理员入口</view>
            <u-icon name="arrow-right" size="24" color="#7A8499"></u-icon>
          </view>
          <view class="settings-item" @click="logout">
            <view class="settings-label">退出登录</view>
            <u-icon name="arrow-right" size="24" color="#7A8499"></u-icon>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import {
  getReservations,
  updateReservationStatus,
  adjustParkingLotQuota,
  getPaymentRecords,
  requestRefund as requestRefundApi
} from '@/pages/util/mockData'

export default {
  data() {
    return {
      isLoggedIn: false, // 登录状态
      tabs: [
        { label: '全部', value: 'all' },
        { label: '预约记录', value: 'reservations' },
        { label: '支付记录', value: 'payments' },
        { label: '待入场', value: 'confirmed' },
        { label: '已完成', value: 'completed' },
        { label: '已取消', value: 'cancelled' }
      ],
      activeTab: 'all',
      reservations: [],
      paymentRecords: [],
      userInfo: {
        name: '',
        phone: '',
        avatar: ''
      },
      stats: {
        totalReservations: 0,
        totalSpent: 0,
        completedReservations: 0
      },
      showSettingsPopup: false
    }
  },
  computed: {
    filteredReservations() {
      if (this.activeTab === 'all' || this.activeTab === 'reservations') {
        return this.reservations
      }
      return this.reservations.filter((item) => item.status === this.activeTab)
    }
  },
  onShow() {
    this.checkLoginStatus()
    // 始终加载数据，未登录时显示空数据
    this.loadData()
    if (this.isLoggedIn) {
      this.loadUserInfo()
    }
    this.calculateStats()
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      try {
        const token = uni.getStorageSync('token')
        const userInfo = uni.getStorageSync('userInfo')

        if (token && userInfo) {
          this.isLoggedIn = true
        } else {
          this.isLoggedIn = false
        }
      } catch (e) {
        console.error('检查登录状态失败', e)
        this.isLoggedIn = false
      }
    },
    // 处理个人信息卡片点击
    handleProfileClick() {
      if (!this.isLoggedIn) {
        this.handleLogin()
      } else {
        this.editProfile()
      }
    },
    // 处理登录
    handleLogin() {
      uni.showModal({
        title: '登录提示',
        content: '需要获取您的微信用户信息以便提供更好的服务，是否允许？',
        success: (res) => {
          if (res.confirm) {
            this.getUserProfile()
          } else {
            uni.showToast({
              title: '您已取消登录',
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    },
    // 获取用户信息
    getUserProfile() {
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          console.log('获取用户信息成功', res.userInfo)

          // 模拟登录接口调用
          this.mockLogin(res.userInfo)
        },
        fail: (err) => {
          console.error('获取用户信息失败', err)
          uni.showToast({
            title: '获取用户信息失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    },
    // 模拟登录接口
    mockLogin(userInfo) {
      // 显示加载提示
      uni.showLoading({
        title: '登录中...'
      })

      // 模拟网络请求延迟
      setTimeout(() => {
        try {
          // 生成模拟token
          const token = 'mock_token_' + Date.now()

          // 构造用户信息
          const userData = {
            name: userInfo.nickName,
            avatar: userInfo.avatarUrl,
            phone: '', // 可以后续绑定
            gender: userInfo.gender === 1 ? '男' : userInfo.gender === 2 ? '女' : '未知',
            city: userInfo.city || '未知'
          }

          // 保存到本地存储
          uni.setStorageSync('token', token)
          uni.setStorageSync('userInfo', JSON.stringify(userData))

          // 更新登录状态
          this.isLoggedIn = true
          this.userInfo = userData

          // 加载数据
          this.loadData()
          this.calculateStats()

          uni.hideLoading()
          uni.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 2000
          })
        } catch (e) {
          console.error('登录失败', e)
          uni.hideLoading()
          uni.showToast({
            title: '登录失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      }, 1000)
    },
    loadData() {
      const list = getReservations()
      this.reservations = list

      // 加载支付记录
      const payments = getPaymentRecords()
      this.paymentRecords = payments
    },
    loadUserInfo() {
      // 从本地存储或API获取用户信息
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.userInfo = JSON.parse(userInfo)
        }
      } catch (e) {
        console.error('获取用户信息失败', e)
      }
    },
    calculateStats() {
      // 计算统计数据
      this.stats.totalReservations = this.reservations.length
      this.stats.completedReservations = this.reservations.filter(item => item.status === 'completed').length

      // 计算总消费
      let totalSpent = 0
      this.paymentRecords.forEach(payment => {
        if (payment.status === 'success') {
          totalSpent += parseFloat(payment.amount)
        }
      })
      this.stats.totalSpent = totalSpent.toFixed(2)
    },
    statusText(status) {
      const mapping = {
        confirmed: '待入场',
        cancelled: '已取消',
        completed: '已完成',
        pending_payment: '待支付'
      }
      return mapping[status] || '处理中'
    },
    paymentStatusText(status) {
      const mapping = {
        success: '支付成功',
        pending: '支付中',
        failed: '支付失败',
        refunded: '已退款'
      }
      return mapping[status] || '未知状态'
    },
    switchTab(tab) {
      this.activeTab = tab
    },
    cancelReservation(id) {
      uni.showModal({
        title: '取消预约',
        content: '确认取消本次预约并释放名额吗？',
        success: (res) => {
          if (res.confirm) {
            const reservation = updateReservationStatus(id, 'cancelled', (nextReservation) => {
              adjustParkingLotQuota(nextReservation.lotId, 1)
              return nextReservation
            })
            if (reservation) {
              this.loadData()
              this.calculateStats()
              uni.showToast({ title: '已取消', icon: 'none' })
            }
          }
        }
      })
    },
    viewDetail(id) {
      uni.navigateTo({ url: `/pages/reserve/success?id=${id}` })
    },
    editProfile() {
      if (!this.isLoggedIn) {
        this.handleLogin()
        return
      }
      uni.navigateTo({ url: '/pages/user/profile' })
    },
    showSettings() {
      if (!this.isLoggedIn) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }
      this.showSettingsPopup = true
    },
    goToProfile() {
      this.showSettingsPopup = false
      this.editProfile()
    },
    goToPrivacy() {
      this.showSettingsPopup = false
      uni.navigateTo({ url: '/pages/user/privacy' })
    },
    goToAbout() {
      this.showSettingsPopup = false
      uni.navigateTo({ url: '/pages/user/about' })
    },
    goToAdmin() {
      this.showSettingsPopup = false
      uni.navigateTo({ url: '/pages/admin/index' })
    },
    logout() {
      this.showSettingsPopup = false
      uni.showModal({
        title: '退出登录',
        content: '确认退出当前账号吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除用户信息
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('token')

            // 更新登录状态
            this.isLoggedIn = false
            this.userInfo = {
              name: '',
              phone: '',
              avatar: ''
            }
            this.reservations = []
            this.paymentRecords = []
            this.stats = {
              totalReservations: 0,
              totalSpent: 0,
              completedReservations: 0
            }

            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          }
        }
      })
    },
    requestRefund(id) {
      uni.showModal({
        title: '申请退款',
        content: '确认申请退款吗？',
        success: (res) => {
          if (res.confirm) {
            const result = requestRefundApi(id)
            if (result) {
              this.loadData()
              uni.showToast({ title: '退款申请已提交', icon: 'success' })
            } else {
              uni.showToast({ title: '退款申请失败', icon: 'none' })
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f3f5f9;
  padding-bottom: 40rpx;
}

.profile-card {
  padding: 40rpx 30rpx 20rpx;
  background: linear-gradient(180deg, #3D7EFF 0%, #EDF3FF 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  /* 确保子元素的绝对定位基于此容器 */
}

.arrow-icon {
  position: absolute;
  right: 20rpx;
  /* 调整箭头距离右侧的间距 */
  top: 50%;
  /* 垂直居中 */
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50rpx;
  height: 50rpx;
}

.avatar {
  position: relative;
  width: 96rpx;
  /* 标准头像尺寸 */
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 48rpx;
  overflow: hidden;
}

.profile-info {
  flex: 1;
  margin-left: 24rpx;
  /* 增加头像与信息之间的间距 */
  color: #fff;
  text-align: left;
  /* 左对齐文字，更接近原始风格 */
}

.greeting {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 34rpx;
}

.subtext {
  font-size: 22rpx;
  opacity: 0.9;
  margin-top: 8rpx;
}

.login-btn {
  padding: 12rpx 26rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18rpx;
  color: #3D7EFF;
  font-size: 26rpx;
  font-weight: 500;
  box-shadow: 0 6rpx 18rpx rgba(61, 126, 255, 0.12);
}

.stats-section {
  margin: 20rpx 30rpx 0;
  padding: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 16rpx rgba(17, 32, 64, 0.06);
  display: flex;
  justify-content: space-between;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stats-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #111;
}

.stats-label {
  font-size: 24rpx;
  color: #7A8499;
  margin-top: 8rpx;
}

.filter-bar {
  margin: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 16rpx;
  box-shadow: 0 12rpx 24rpx rgba(17, 32, 64, 0.04);
  display: flex;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-item {
  flex-shrink: 0;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: #7A8499;
  border-radius: 16rpx;
  margin-right: 16rpx;

  &:last-child {
    margin-right: 0;
  }

  &.active {
    background: #3D7EFF;
    color: #fff;
  }
}

.settings-section {
  margin: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 0 30rpx;
  box-shadow: 0 12rpx 24rpx rgba(17, 32, 64, 0.04);
  position: relative;
  /* 确保子元素的绝对定位基于此容器 */
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
}

.settings-text {
  flex: 1;
  font-size: 28rpx;
  color: #111;
  margin-left: 20rpx;
}

.list {
  height: calc(100vh - 520rpx);
  padding: 0 30rpx;
}

.empty {
  padding: 100rpx 0;
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
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #7A8499;
}

.reservation-card,
.payment-card {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 12rpx 24rpx rgba(17, 32, 64, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lot-name,
.payment-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
}

.amount {
  font-size: 32rpx;
  font-weight: 600;
  color: #FF5A5F;
}

.status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;

  &.status-confirmed {
    background: rgba(61, 126, 255, 0.12);
    color: #3D7EFF;
  }

  &.status-completed {
    background: rgba(82, 196, 26, 0.12);
    color: #52C41A;
  }

  &.status-cancelled {
    background: rgba(255, 90, 95, 0.12);
    color: #FF5A5F;
  }

  &.status-pending_payment {
    background: rgba(255, 180, 0, 0.12);
    color: #FFB400;
  }
}

.card-body {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #F0F3FB;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;

  &:first-child {
    margin-top: 0;
  }
}

.label {
  font-size: 26rpx;
  color: #7A8499;
}

.value {
  font-size: 26rpx;
  color: #111;
  font-weight: 500;
}

.card-footer {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #F0F3FB;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.payment-status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;

  &.payment-success {
    background: rgba(82, 196, 26, 0.12);
    color: #52C41A;
  }

  &.payment-pending {
    background: rgba(255, 180, 0, 0.12);
    color: #FFB400;
  }

  &.payment-failed {
    background: rgba(255, 90, 95, 0.12);
    color: #FF5A5F;
  }

  &.payment-refunded {
    background: rgba(17, 144, 255, 0.12);
    color: #1890FF;
  }
}

.settings-popup {
  padding: 30rpx;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
}

.settings-list {
  padding: 20rpx 0;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;

  &:not(:last-child) {
    border-bottom: 2rpx solid #F0F3FB;
  }
}

.settings-label {
  font-size: 28rpx;
  color: #111;
}
</style>