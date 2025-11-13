<template>
  <view class="privacy-page">
    <view class="header">
      <view class="title">隐私政策</view>
      <view class="update-time">更新时间：2025-11-09</view>
    </view>

    <view class="content">
      <view class="section">
        <view class="section-title">一、信息收集</view>
        <view class="section-text">
          我们会收集您在使用服务时主动提供的信息，包括但不限于：
        </view>
        <view class="list-item">• 账号信息（微信授权信息）</view>
        <view class="list-item">• 手机号码（用于预约通知）</view>
        <view class="list-item">• 位置信息（用于停车场定位）</view>
        <view class="list-item">• 车辆信息（用于预约服务）</view>
      </view>

      <view class="section">
        <view class="section-title">二、信息使用</view>
        <view class="section-text">
          我们收集的信息将用于：
        </view>
        <view class="list-item">• 提供停车场预约服务</view>
        <view class="list-item">• 发送预约确认和提醒</view>
        <view class="list-item">• 改进和优化服务体验</view>
        <view class="list-item">• 处理用户反馈和投诉</view>
      </view>

      <view class="section">
        <view class="section-title">三、信息保护</view>
        <view class="section-text">
          我们承诺：
        </view>
        <view class="list-item">• 不会将您的个人信息出售给第三方</view>
        <view class="list-item">• 采用安全措施保护您的信息</view>
        <view class="list-item">• 仅在必要时访问您的信息</view>
        <view class="list-item">• 您有权随时查看、修改或删除个人信息</view>
      </view>

      <view class="section">
        <view class="section-title">四、权限说明</view>
        <view class="section-text">
          应用需要以下权限：
        </view>
        <view class="list-item">
          <text class="bold">位置权限：</text>用于查找附近停车场和导航
        </view>
        <view class="list-item">
          <text class="bold">相机权限：</text>用于扫码入场和拍照上传
        </view>
        <view class="list-item">
          <text class="bold">通知权限：</text>用于发送预约提醒和状态通知
        </view>
      </view>

      <view class="section">
        <view class="section-title">五、联系我们</view>
        <view class="section-text">
          如对本隐私政策有任何疑问，请联系我们：
        </view>
        <view class="list-item">邮箱：support@parking.com</view>
        <view class="list-item">客服电话：400-xxx-xxxx</view>
      </view>
    </view>

    <view class="footer">
      <u-button
        type="primary"
        size="large"
        shape="circle"
        @click="handleAgree"
      >我已阅读并同意</u-button>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    handleAgree() {
      uni.setStorageSync('privacyAgreed', true)
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.privacy-page {
  min-height: 100vh;
  background: #fff;
  padding: 40rpx 30rpx 120rpx;
}

.header {
  margin-bottom: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  color: #111;
  margin-bottom: 16rpx;
}

.update-time {
  font-size: 24rpx;
  color: #7A8499;
}

.content {
  line-height: 1.8;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
  margin-bottom: 20rpx;
}

.section-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.list-item {
  font-size: 28rpx;
  color: #555;
  margin-bottom: 12rpx;
  padding-left: 20rpx;
}

.bold {
  font-weight: 600;
  color: #3D7EFF;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}
</style>
