<template>
  <view class="about-page">
    <view class="hero">
      <view class="logo">
        <u-icon name="car" size="120" color="#3D7EFF"></u-icon>
      </view>
      <view class="app-name">停车预约</view>
      <view class="version">v1.0.0</view>
    </view>

    <view class="info-section">
      <view class="info-item">
        <view class="info-label">应用名称</view>
        <view class="info-value">停车场预约系统</view>
      </view>
      <view class="info-item">
        <view class="info-label">当前版本</view>
        <view class="info-value">1.0.0</view>
      </view>
      <view class="info-item" @click="checkUpdate">
        <view class="info-label">检查更新</view>
        <view class="info-value">
          <u-icon name="arrow-right" size="24" color="#7A8499"></u-icon>
        </view>
      </view>
    </view>

    <view class="intro-section">
      <view class="intro-title">关于我们</view>
      <view class="intro-text">
        停车场预约系统是一款智能停车服务应用，致力于为用户提供便捷、高效的停车场预约体验。
      </view>
      <view class="intro-text">
        通过我们的平台，您可以：
      </view>
      <view class="feature-list">
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="32" color="#3D7EFF"></u-icon>
          <text class="feature-text">实时查看附近停车场</text>
        </view>
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="32" color="#3D7EFF"></u-icon>
          <text class="feature-text">在线预约车位</text>
        </view>
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="32" color="#3D7EFF"></u-icon>
          <text class="feature-text">便捷支付停车费</text>
        </view>
        <view class="feature-item">
          <u-icon name="checkmark-circle" size="32" color="#3D7EFF"></u-icon>
          <text class="feature-text">查看历史记录</text>
        </view>
      </view>
    </view>

    <view class="contact-section">
      <view class="contact-title">联系我们</view>
      <view class="contact-item">
        <u-icon name="email" size="32" color="#3D7EFF"></u-icon>
        <text class="contact-text">support@parking.com</text>
      </view>
      <view class="contact-item">
        <u-icon name="phone" size="32" color="#3D7EFF"></u-icon>
        <text class="contact-text">400-xxx-xxxx</text>
      </view>
    </view>

    <view class="footer">
      <view class="copyright">© 2025 停车预约. All rights reserved.</view>
      <view class="links">
        <text class="link" @click="goPrivacy">隐私政策</text>
        <text class="separator">|</text>
        <text class="link" @click="goTerms">用户协议</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    checkUpdate() {
      uni.showToast({
        title: '已是最新版本',
        icon: 'success'
      })
    },
    goPrivacy() {
      uni.navigateTo({
        url: '/pages/user/privacy'
      })
    },
    goTerms() {
      uni.showToast({
        title: '用户协议页面开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: #f3f5f9;
  padding-bottom: 40rpx;
}

.hero {
  background: linear-gradient(180deg, #3D7EFF 0%, #5A8DFF 100%);
  padding: 80rpx 30rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
}

.version {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.info-section {
  background: #fff;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
  overflow: hidden;
  margin: 0 30rpx 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #F0F3FB;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #111;
}

.info-value {
  font-size: 28rpx;
  color: #7A8499;
}

.intro-section {
  background: #fff;
  margin: 0 30rpx 20rpx;
  padding: 40rpx 30rpx;
  border-radius: 24rpx;
}

.intro-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
  margin-bottom: 24rpx;
}

.intro-text {
  font-size: 28rpx;
  color: #555;
  line-height: 1.8;
  margin-bottom: 20rpx;
}

.feature-list {
  margin-top: 30rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #333;
}

.contact-section {
  background: #fff;
  margin: 0 30rpx 20rpx;
  padding: 40rpx 30rpx;
  border-radius: 24rpx;
}

.contact-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
  margin-bottom: 30rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.contact-text {
  font-size: 28rpx;
  color: #333;
}

.footer {
  padding: 40rpx 30rpx;
  text-align: center;
}

.copyright {
  font-size: 24rpx;
  color: #7A8499;
  margin-bottom: 16rpx;
}

.links {
  font-size: 24rpx;
  color: #3D7EFF;
}

.link {
  padding: 0 16rpx;
}

.separator {
  color: #D0D5DD;
}
</style>
