# AutoPark Vue 2 到 Vue 3 迁移规划

## 📋 项目现状分析

### 当前问题
- **项目配置**: `manifest.json` 中 `"vueVersion": "3"` - 项目已配置为 Vue 3
- **UI 库版本**: 使用 uView UI 2.0.3，该版本**不支持 Vue 3** (`"vue3": "n"`)
- **代码实现**: `main.js` 使用 Vue 2 语法 (`new Vue()`)，与配置不匹配
- **运行错误**: `Cannot read property 'props' of undefined` - uView UI 初始化失败

### 根本原因
Vue 3 项目引入了 Vue 2 专用的 UI 库，导致运行时错误。

---

## 🎯 迁移方案

### 方案选择：完整迁移到 Vue 3（推荐）

**优势**:
- ✅ 符合项目配置，避免版本冲突
- ✅ 享受 Vue 3 新特性（Composition API、更好的 TypeScript 支持、性能提升）
- ✅ 长期可维护性更好
- ✅ uni-app 对 Vue 3 支持日趋完善

**劣势**:
- ⚠️ 需要替换 UI 库（uView UI 2.x 不支持 Vue 3）
- ⚠️ 需要改造入口文件和部分代码
- ⚠️ 初期迁移成本较高

---

## 📅 迁移步骤（分阶段执行）

### 阶段 1：准备工作 ✅
- [x] 分析项目结构
- [x] 确认 Vue 版本配置
- [x] 识别不兼容的依赖
- [x] 制定迁移计划文档

### 阶段 2：选择并安装 Vue 3 兼容的 UI 库

#### 选项 1：uView Plus（uView UI 的 Vue 3 版本） ⭐ 推荐
- **官网**: https://uviewui.com/
- **特点**: 
  - uView UI 官方 Vue 3 版本
  - API 与 uView 2.x 基本一致，迁移成本低
  - 组件丰富，文档完善
  - 持续维护中

#### 选项 2：Wot Design Uni（微信官方推荐）
- **官网**: https://wot-design-uni.cn/
- **特点**:
  - 京东开发，微信官方推荐
  - Vue 3 + TypeScript
  - 组件设计规范
  
#### 选项 3：uniapp-ui（轻量级）
- **特点**: 轻量、简洁，但组件相对较少

**推荐选择**: **uView Plus**，原因：
1. 与现有 uView UI 2.x API 相似度高，迁移成本最低
2. 组件覆盖全面
3. 社区活跃

### 阶段 3：修改入口文件（main.js）

#### 当前代码（Vue 2 语法）
```javascript
import Vue from 'vue'
import App from './App'
import uView from '@/uni_modules/uview-ui'

Vue.config.productionTip = false
Vue.use(uView)

App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
```

#### 修改后（Vue 3 语法）
```javascript
import { createSSRApp } from 'vue'
import App from './App.vue'
// 引入 uView Plus（假设使用）
import uviewPlus from '@/uni_modules/uview-plus'

export function createApp() {
  const app = createSSRApp(App)
  
  // 使用 uView Plus
  app.use(uviewPlus)
  
  return {
    app
  }
}
```

### 阶段 4：修改 App.vue

#### 需要调整的部分
1. **移除 Vue 2 特有的 Options API**（可选，也可以继续使用）
2. **全局样式引入方式保持不变**

#### 样式部分调整
```vue
<style lang="scss">
  /* 全局样式 */
  @import "@/uni_modules/uview-plus/index.scss"; // 改为新 UI 库路径
  @import "@/styles/global.scss";
  
  /* 全局重置 */
  * {
    box-sizing: border-box;
  }
  
  view, navigator {
    box-sizing: border-box;
  }
</style>
```

### 阶段 5：修改 uni.scss

#### 当前代码
```scss
@import '@/uni_modules/uview-ui/theme.scss';
```

#### 修改后
```scss
@import '@/uni_modules/uview-plus/theme.scss';
```

### 阶段 6：修改页面组件

#### Vue 2 写法示例
```vue
<script>
export default {
  data() {
    return {
      loading: false
    }
  },
  methods: {
    handleClick() {
      // ...
    }
  }
}
</script>
```

#### Vue 3 Composition API 写法（推荐）
```vue
<script setup>
import { ref } from 'vue'

const loading = ref(false)

const handleClick = () => {
  // ...
}
</script>
```

#### Vue 3 Options API 写法（兼容）
```vue
<script>
export default {
  data() {
    return {
      loading: false
    }
  },
  methods: {
    handleClick() {
      // ...
    }
  }
}
</script>
```

**建议**: 新组件使用 `<script setup>`，现有组件可以继续使用 Options API（Vue 3 完全兼容）。

### 阶段 7：替换 UI 组件

需要批量替换的组件（如果使用 uView Plus）：

| Vue 2 (uView UI)  | Vue 3 (uView Plus) | 备注 |
|-------------------|-------------------|------|
| `<u-icon>`        | `<up-icon>`       | 组件前缀改为 `up-` |
| `<u-button>`      | `<up-button>`     | 同上 |
| `<u-skeleton>`    | `<up-skeleton>`   | 同上 |
| `<u-empty>`       | `<up-empty>`      | 同上 |

**批量替换策略**:
1. 使用全局搜索替换：`<u-` → `<up-`
2. 使用全局搜索替换：`</u-` → `</up-`
3. 检查并测试每个页面

### 阶段 8：处理 pages.json

`pages.json` 无需修改，Vue 2 和 Vue 3 的配置格式一致。

### 阶段 9：处理全局 API 变化

#### Vue 2 → Vue 3 主要变化

| Vue 2                | Vue 3                          | 说明 |
|---------------------|--------------------------------|------|
| `Vue.prototype.$xxx` | `app.config.globalProperties.$xxx` | 全局属性 |
| `Vue.filter()`      | 移除（使用方法或计算属性代替）      | 全局过滤器 |
| `new Vue()`         | `createApp()`                  | 创建应用 |
| `Vue.use()`         | `app.use()`                    | 使用插件 |

#### 示例：挂载全局属性
```javascript
// Vue 2
Vue.prototype.$api = api

// Vue 3
app.config.globalProperties.$api = api
```

---

## 📦 依赖安装命令

### 方案 1：使用 uView Plus（推荐）

1. **移除旧的 uView UI**
   ```bash
   # 删除 uni_modules/uview-ui 目录
   Remove-Item -Recurse -Force ./uni_modules/uview-ui
   ```

2. **安装 uView Plus**
   
   **方式 1：通过 HBuilderX 插件市场**
   - 访问：https://ext.dcloud.net.cn/plugin?name=uview-plus
   - 点击"下载插件并导入 HBuilderX"
   
   **方式 2：通过 npm（如果项目支持）**
   ```bash
   npm install uview-plus
   ```

---

## 🧪 测试计划

### 功能测试清单
- [ ] 页面正常渲染
- [ ] 所有 UI 组件正常显示
- [ ] 交互功能正常（点击、输入等）
- [ ] 页面跳转正常
- [ ] 数据加载和刷新正常
- [ ] 样式显示正确
- [ ] 地图组件正常工作
- [ ] 图标显示正常

### 兼容性测试
- [ ] 微信小程序
- [ ] H5
- [ ] App（如需要）

---

## ⚠️ 注意事项与风险

### 1. 破坏性变更
- uView UI 的组件名称、API 可能与 uView Plus 有差异
- 部分高级功能可能需要重新实现

### 2. 样式问题
- SCSS mixin 和变量可能有变化
- 需要重新测试所有页面的样式

### 3. 第三方插件兼容性
- 检查项目中其他 uni_modules 插件是否支持 Vue 3
- 如不支持，需要寻找替代方案

### 4. 性能影响
- Vue 3 性能更好，但初次编译可能较慢
- 建议清理编译缓存后重新编译

---

## 📚 参考资源

- **Vue 3 官方文档**: https://cn.vuejs.org/
- **uni-app Vue 3 支持**: https://uniapp.dcloud.net.cn/tutorial/vue3-api.html
- **uView Plus 文档**: https://uviewui.com/
- **Vue 2 到 Vue 3 迁移指南**: https://v3-migration.vuejs.org/

---

## 🚀 快速开始

### 立即执行的步骤

1. **备份当前项目**
   ```bash
   # 创建备份分支
   git checkout -b backup-vue2
   git add .
   git commit -m "备份 Vue 2 版本"
   git checkout main
   ```

2. **安装 uView Plus**
   - 通过 HBuilderX 插件市场安装

3. **修改 main.js**
   - 使用上述 Vue 3 语法

4. **批量替换组件**
   - `<u-` → `<up-`

5. **清理编译缓存并测试**
   ```bash
   Remove-Item -Recurse -Force ./unpackage/dist
   ```

---

## 📝 迁移进度跟踪

- [ ] 阶段 1：准备工作
- [ ] 阶段 2：安装 uView Plus
- [ ] 阶段 3：修改 main.js
- [ ] 阶段 4：修改 App.vue
- [ ] 阶段 5：修改 uni.scss
- [ ] 阶段 6：改造页面组件（可选使用 Composition API）
- [ ] 阶段 7：替换 UI 组件
- [ ] 阶段 8：全局 API 调整
- [ ] 阶段 9：测试验证
- [ ] 阶段 10：上线部署

---

## 💡 后续优化建议

1. **逐步采用 Composition API**
   - 新功能使用 `<script setup>`
   - 复杂逻辑使用 composables 封装

2. **引入 TypeScript**（可选）
   - 提升代码健壮性
   - 更好的 IDE 支持

3. **性能优化**
   - 使用 Vue 3 的 `<Suspense>` 处理异步组件
   - 利用 `<Teleport>` 优化弹窗类组件

4. **代码规范**
   - 统一使用 ESLint + Prettier
   - 制定 Vue 3 编码规范

---

**文档版本**: v1.0  
**创建时间**: 2025-11-14  
**最后更新**: 2025-11-14  
**维护者**: GitHub Copilot
