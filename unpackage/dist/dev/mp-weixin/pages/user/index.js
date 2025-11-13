"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_util_mockData = require("../util/mockData.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isLoggedIn: false,
      // 登录状态
      tabs: [
        { label: "全部", value: "all" },
        { label: "预约记录", value: "reservations" },
        { label: "支付记录", value: "payments" },
        { label: "待入场", value: "confirmed" },
        { label: "已完成", value: "completed" },
        { label: "已取消", value: "cancelled" }
      ],
      activeTab: "all",
      reservations: [],
      paymentRecords: [],
      userInfo: {
        name: "",
        phone: "",
        avatar: ""
      },
      stats: {
        totalReservations: 0,
        totalSpent: 0,
        completedReservations: 0
      },
      showSettingsPopup: false
    };
  },
  computed: {
    filteredReservations() {
      if (this.activeTab === "all" || this.activeTab === "reservations") {
        return this.reservations;
      }
      return this.reservations.filter((item) => item.status === this.activeTab);
    }
  },
  onShow() {
    this.checkLoginStatus();
    this.loadData();
    if (this.isLoggedIn) {
      this.loadUserInfo();
    }
    this.calculateStats();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      try {
        const token = common_vendor.index.getStorageSync("token");
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (token && userInfo) {
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/index.vue:235", "检查登录状态失败", e);
        this.isLoggedIn = false;
      }
    },
    // 处理个人信息卡片点击
    handleProfileClick() {
      if (!this.isLoggedIn) {
        this.handleLogin();
      } else {
        this.editProfile();
      }
    },
    // 处理登录
    handleLogin() {
      common_vendor.index.showModal({
        title: "登录提示",
        content: "需要获取您的微信用户信息以便提供更好的服务，是否允许？",
        success: (res) => {
          if (res.confirm) {
            this.getUserProfile();
          } else {
            common_vendor.index.showToast({
              title: "您已取消登录",
              icon: "none",
              duration: 2e3
            });
          }
        }
      });
    },
    // 获取用户信息
    getUserProfile() {
      common_vendor.index.getUserProfile({
        desc: "用于完善用户资料",
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/user/index.vue:270", "获取用户信息成功", res.userInfo);
          this.mockLogin(res.userInfo);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/user/index.vue:276", "获取用户信息失败", err);
          common_vendor.index.showToast({
            title: "获取用户信息失败，请重试",
            icon: "none",
            duration: 2e3
          });
        }
      });
    },
    // 模拟登录接口
    mockLogin(userInfo) {
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      setTimeout(() => {
        try {
          const token = "mock_token_" + Date.now();
          const userData = {
            name: userInfo.nickName,
            avatar: userInfo.avatarUrl,
            phone: "",
            // 可以后续绑定
            gender: userInfo.gender === 1 ? "男" : userInfo.gender === 2 ? "女" : "未知",
            city: userInfo.city || "未知"
          };
          common_vendor.index.setStorageSync("token", token);
          common_vendor.index.setStorageSync("userInfo", JSON.stringify(userData));
          this.isLoggedIn = true;
          this.userInfo = userData;
          this.loadData();
          this.calculateStats();
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success",
            duration: 2e3
          });
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/user/index.vue:326", "登录失败", e);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "登录失败，请重试",
            icon: "none",
            duration: 2e3
          });
        }
      }, 1e3);
    },
    loadData() {
      const list = pages_util_mockData.getReservations();
      this.reservations = list;
      const payments = pages_util_mockData.getPaymentRecords();
      this.paymentRecords = payments;
    },
    loadUserInfo() {
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (userInfo) {
          this.userInfo = JSON.parse(userInfo);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/user/index.vue:352", "获取用户信息失败", e);
      }
    },
    calculateStats() {
      this.stats.totalReservations = this.reservations.length;
      this.stats.completedReservations = this.reservations.filter((item) => item.status === "completed").length;
      let totalSpent = 0;
      this.paymentRecords.forEach((payment) => {
        if (payment.status === "success") {
          totalSpent += parseFloat(payment.amount);
        }
      });
      this.stats.totalSpent = totalSpent.toFixed(2);
    },
    statusText(status) {
      const mapping = {
        confirmed: "待入场",
        cancelled: "已取消",
        completed: "已完成",
        pending_payment: "待支付"
      };
      return mapping[status] || "处理中";
    },
    paymentStatusText(status) {
      const mapping = {
        success: "支付成功",
        pending: "支付中",
        failed: "支付失败",
        refunded: "已退款"
      };
      return mapping[status] || "未知状态";
    },
    switchTab(tab) {
      this.activeTab = tab;
    },
    cancelReservation(id) {
      common_vendor.index.showModal({
        title: "取消预约",
        content: "确认取消本次预约并释放名额吗？",
        success: (res) => {
          if (res.confirm) {
            const reservation = pages_util_mockData.updateReservationStatus(id, "cancelled", (nextReservation) => {
              pages_util_mockData.adjustParkingLotQuota(nextReservation.lotId, 1);
              return nextReservation;
            });
            if (reservation) {
              this.loadData();
              this.calculateStats();
              common_vendor.index.showToast({ title: "已取消", icon: "none" });
            }
          }
        }
      });
    },
    viewDetail(id) {
      common_vendor.index.navigateTo({ url: `/pages/reserve/success?id=${id}` });
    },
    editProfile() {
      if (!this.isLoggedIn) {
        this.handleLogin();
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/user/profile" });
    },
    showSettings() {
      if (!this.isLoggedIn) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      this.showSettingsPopup = true;
    },
    goToProfile() {
      this.showSettingsPopup = false;
      this.editProfile();
    },
    goToPrivacy() {
      this.showSettingsPopup = false;
      common_vendor.index.navigateTo({ url: "/pages/user/privacy" });
    },
    goToAbout() {
      this.showSettingsPopup = false;
      common_vendor.index.navigateTo({ url: "/pages/user/about" });
    },
    goToAdmin() {
      this.showSettingsPopup = false;
      common_vendor.index.navigateTo({ url: "/pages/admin/index" });
    },
    logout() {
      this.showSettingsPopup = false;
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确认退出当前账号吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.removeStorageSync("token");
            this.isLoggedIn = false;
            this.userInfo = {
              name: "",
              phone: "",
              avatar: ""
            };
            this.reservations = [];
            this.paymentRecords = [];
            this.stats = {
              totalReservations: 0,
              totalSpent: 0,
              completedReservations: 0
            };
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
          }
        }
      });
    },
    requestRefund(id) {
      common_vendor.index.showModal({
        title: "申请退款",
        content: "确认申请退款吗？",
        success: (res) => {
          if (res.confirm) {
            const result = pages_util_mockData.requestRefund(id);
            if (result) {
              this.loadData();
              common_vendor.index.showToast({ title: "退款申请已提交", icon: "success" });
            } else {
              common_vendor.index.showToast({ title: "退款申请失败", icon: "none" });
            }
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_u_avatar = common_vendor.resolveComponent("u-avatar");
  const _component_u_button = common_vendor.resolveComponent("u-button");
  const _component_u_icon = common_vendor.resolveComponent("u-icon");
  const _component_u_popup = common_vendor.resolveComponent("u-popup");
  (_component_u_avatar + _component_u_button + _component_u_icon + _component_u_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isLoggedIn && $data.userInfo.avatar
  }, $data.isLoggedIn && $data.userInfo.avatar ? {
    b: common_vendor.p({
      src: $data.userInfo.avatar,
      size: "large"
    })
  } : {}, {
    c: common_vendor.t($data.isLoggedIn ? $data.userInfo.name || "微信用户" : "点击登录查看信息"),
    d: common_vendor.t($data.isLoggedIn ? $data.userInfo.phone || "" : " "),
    e: !$data.isLoggedIn
  }, !$data.isLoggedIn ? {
    f: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args))
  } : {}, {
    g: common_vendor.t($data.stats.totalReservations),
    h: common_vendor.o(($event) => $options.switchTab("reservations")),
    i: common_vendor.t($data.stats.totalSpent),
    j: common_vendor.o(($event) => $options.switchTab("payments")),
    k: common_vendor.t($data.stats.completedReservations),
    l: common_vendor.o(($event) => $options.switchTab("completed")),
    m: common_vendor.f($data.tabs, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.value,
        c: $data.activeTab === item.value ? 1 : "",
        d: common_vendor.o(($event) => $options.switchTab(item.value), item.value)
      };
    }),
    n: $data.activeTab === "reservations" || $data.activeTab === "all" || $data.activeTab === "confirmed" || $data.activeTab === "cancelled" || $data.activeTab === "completed"
  }, $data.activeTab === "reservations" || $data.activeTab === "all" || $data.activeTab === "confirmed" || $data.activeTab === "cancelled" || $data.activeTab === "completed" ? common_vendor.e({
    o: $options.filteredReservations.length === 0
  }, $options.filteredReservations.length === 0 ? {
    p: common_assets._imports_0
  } : {}, {
    q: common_vendor.f($options.filteredReservations, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.lotName),
        b: common_vendor.t($options.statusText(item.status)),
        c: common_vendor.n("status-" + item.status),
        d: common_vendor.t(item.reservationDate),
        e: common_vendor.t(item.arrivalTime),
        f: common_vendor.t(item.reservationDays),
        g: common_vendor.t(item.depositAmount),
        h: item.couponAmount && item.couponAmount > 0
      }, item.couponAmount && item.couponAmount > 0 ? {
        i: common_vendor.t(item.couponAmount)
      } : {}, {
        j: item.status === "confirmed"
      }, item.status === "confirmed" ? {
        k: common_vendor.o(($event) => $options.cancelReservation(item.id), item.id),
        l: "79e6a490-1-" + i0,
        m: common_vendor.p({
          size: "mini",
          plain: true,
          shape: "circle",
          color: "#3D7EFF"
        })
      } : {}, {
        n: common_vendor.o(($event) => $options.viewDetail(item.id), item.id),
        o: "79e6a490-2-" + i0,
        p: item.id
      });
    }),
    r: common_vendor.p({
      size: "mini",
      plain: true,
      shape: "circle",
      color: "#7A8499"
    })
  }) : {}, {
    s: $data.activeTab === "payments"
  }, $data.activeTab === "payments" ? common_vendor.e({
    t: $data.paymentRecords.length === 0
  }, $data.paymentRecords.length === 0 ? {
    v: common_assets._imports_0
  } : {}, {
    w: common_vendor.f($data.paymentRecords, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.amount),
        c: common_vendor.t(item.paymentTime),
        d: common_vendor.t(item.paymentMethod),
        e: common_vendor.t(item.transactionId),
        f: common_vendor.t($options.paymentStatusText(item.status)),
        g: common_vendor.n("payment-" + item.status),
        h: item.status === "success" && item.canRefund
      }, item.status === "success" && item.canRefund ? {
        i: common_vendor.o(($event) => $options.requestRefund(item.id), item.id),
        j: "79e6a490-3-" + i0,
        k: common_vendor.p({
          size: "mini",
          plain: true,
          shape: "circle",
          color: "#FF5A5F"
        })
      } : {}, {
        l: item.id
      });
    })
  }) : {}, {
    x: common_vendor.p({
      name: "setting",
      size: "28",
      color: "#3D7EFF"
    }),
    y: common_vendor.p({
      name: "arrow-right",
      size: "24",
      color: "#7A8499"
    }),
    z: common_vendor.o((...args) => $options.showSettings && $options.showSettings(...args)),
    A: common_vendor.o(($event) => $data.showSettingsPopup = false),
    B: common_vendor.p({
      name: "close"
    }),
    C: common_vendor.p({
      name: "arrow-right",
      size: "24",
      color: "#7A8499"
    }),
    D: common_vendor.o((...args) => $options.goToProfile && $options.goToProfile(...args)),
    E: common_vendor.p({
      name: "arrow-right",
      size: "24",
      color: "#7A8499"
    }),
    F: common_vendor.o((...args) => $options.goToPrivacy && $options.goToPrivacy(...args)),
    G: common_vendor.p({
      name: "arrow-right",
      size: "24",
      color: "#7A8499"
    }),
    H: common_vendor.o((...args) => $options.goToAbout && $options.goToAbout(...args)),
    I: common_vendor.p({
      name: "arrow-right",
      size: "24",
      color: "#7A8499"
    }),
    J: common_vendor.o((...args) => $options.goToAdmin && $options.goToAdmin(...args)),
    K: common_vendor.p({
      name: "arrow-right",
      size: "24",
      color: "#7A8499"
    }),
    L: common_vendor.o((...args) => $options.logout && $options.logout(...args)),
    M: common_vendor.o(($event) => $data.showSettingsPopup = false),
    N: common_vendor.p({
      show: $data.showSettingsPopup,
      mode: "bottom",
      round: true
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-79e6a490"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/index.js.map
