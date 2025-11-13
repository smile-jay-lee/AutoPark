<template>
  <view class="profile-page">
    <view class="avatar-section">
      <view class="avatar" @click="chooseAvatar">
        <u-avatar
          :src="userInfo.avatar || ''"
          :text="userInfo.name || '用户'"
          size="large"
          bg-color="#3D7EFF"
        ></u-avatar>
        <view class="edit-icon">
          <u-icon name="camera" size="20" color="#fff"></u-icon>
        </view>
      </view>
      <view class="avatar-tip">点击修改头像</view>
    </view>

    <view class="form-section">
      <u-form :model="formData" ref="form">
        <u-form-item label="昵称" prop="name">
          <u-input
            v-model="formData.name"
            placeholder="请输入昵称"
            border="none"
          ></u-input>
        </u-form-item>

        <u-form-item label="手机号" prop="phone">
          <u-input
            v-model="formData.phone"
            placeholder="请输入手机号"
            type="number"
            maxlength="11"
            border="none"
          ></u-input>
        </u-form-item>

        <u-form-item label="性别" prop="gender">
          <u-radio-group v-model="formData.gender">
            <u-radio name="male" label="男"></u-radio>
            <u-radio name="female" label="女"></u-radio>
          </u-radio-group>
        </u-form-item>
      </u-form>
    </view>

    <view class="button-section">
      <u-button
        type="primary"
        size="large"
        shape="circle"
        @click="handleSave"
      >保存</u-button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {},
      formData: {
        name: '',
        phone: '',
        gender: '',
        avatar: ''
      }
    }
  },
  onLoad() {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.userInfo = userInfo
          this.formData = {
            name: userInfo.name || '',
            phone: userInfo.phone || '',
            gender: userInfo.gender || 'male',
            avatar: userInfo.avatar || ''
          }
        }
      } catch (e) {
        console.error('获取用户信息失败', e)
      }
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.avatar = res.tempFilePaths[0]
          this.userInfo.avatar = res.tempFilePaths[0]
        }
      })
    },
    handleSave() {
      // 验证手机号
      if (this.formData.phone && !/^1[3-9]\d{9}$/.test(this.formData.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }

      // 保存用户信息
      const updatedInfo = {
        ...this.userInfo,
        ...this.formData
      }

      try {
        uni.setStorageSync('userInfo', updatedInfo)
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (e) {
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f3f5f9;
}

.avatar-section {
  padding: 60rpx 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  position: relative;
  margin-bottom: 20rpx;
}

.edit-icon {
  position: absolute;
  right: -10rpx;
  bottom: -10rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #3D7EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar-tip {
  font-size: 24rpx;
  color: #7A8499;
}

.form-section {
  background: #fff;
  padding: 0 30rpx;
}

.button-section {
  padding: 60rpx 30rpx;
}
</style>
