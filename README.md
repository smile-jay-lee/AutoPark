# AutoPark 项目

## 项目简介
AutoPark 是一个多功能的停车场管理系统，旨在为用户提供便捷的停车场预约、导航和管理功能。该项目支持多平台开发，包括微信小程序、H5 和 App，具有良好的用户体验和高效的后台管理功能。

## 目录结构
以下是项目的主要目录结构：

```
AutoPark/
├── App.vue                # 主应用入口文件
├── index.html             # HTML 模板文件
├── main.js                # 应用主入口 JS 文件
├── manifest.json          # 应用配置文件
├── pages.json             # 页面配置文件
├── project.config.json    # 项目配置文件
├── project.private.config.json # 私有项目配置文件
├── uni.promisify.adaptor.js # Promise 适配器
├── uni.scss               # 全局样式文件
├── pages/                 # 页面目录
│   ├── common/            # 公共模块
│   │   └── storage.js     # 本地存储工具
│   ├── components/        # 公共组件
│   │   ├── MapView.vue    # 地图视图组件
│   │   └── page-nav/      # 页面导航组件
│   │       └── page-nav.vue
│   ├── home/              # 首页模块
│   │   └── index.vue      # 首页视图
│   └── util/              # 工具模块
│       └── mockData.js    # 模拟数据工具
├── static/                # 静态资源目录
├── unpackage/             # 编译输出目录
parking/                   # 停车场相关模块
├── LICENSE                # 开源协议文件
├── package.json           # 项目依赖配置文件
├── postcss.config.js      # PostCSS 配置文件
├── project.config.json    # 项目配置文件
├── project.private.config.json # 私有项目配置文件
├── README.md              # 项目说明文件
├── sitemap.json           # 网站地图配置
├── tsconfig.json          # TypeScript 配置文件
├── vue.config.js          # Vue CLI 配置文件
├── backup/                # 备份文件目录
│   ├── root-cleanup/      # 修复相关文档
│   └── root-files-backup/ # 根目录文件备份
├── docs/                  # 文档目录
│   ├── OPTIMIZATION_SUMMARY.md # 优化总结
│   └── PROJECT_OPTIMIZATION_GUIDE.md # 优化指南
├── src/                   # 源代码目录
│   ├── App.vue            # 主应用入口文件
│   ├── main.js            # 应用主入口 JS 文件
│   ├── manifest.json      # 应用配置文件
│   ├── pages.json         # 页面配置文件
│   ├── project.config.json # 项目配置文件
│   ├── project.private.config.json # 私有项目配置文件
│   ├── uni.scss           # 全局样式文件
│   ├── common/            # 公共模块
│   ├── components/        # 公共组件
│   ├── pages/             # 页面模块
│   ├── static/            # 静态资源
│   ├── store/             # Vuex 状态管理
│   ├── styles/            # 样式文件
│   ├── uni_modules/       # UniApp 模块
│   └── util/              # 工具模块
├── static/                # 静态资源目录
└── uniCloud-tcb/          # 云开发目录
    ├── cloudfunctions/    # 云函数
    ├── database/          # 数据库
    └── frontend/          # 前端代码
```

## 功能特性
- **停车场预约**：用户可以通过应用快速预约停车位。
- **导航功能**：集成地图导航，帮助用户快速找到停车场。
- **多平台支持**：支持微信小程序、H5 和 App。
- **后台管理**：提供高效的停车场管理后台。
- **云开发支持**：使用 UniCloud 提供云函数和数据库支持。

## 技术栈
- **前端框架**：Vue.js, UniApp
- **状态管理**：Vuex
- **样式**：SCSS
- **后端**：UniCloud 云开发
- **地图服务**：高德地图 API

## 安装与运行

### 环境要求
- Node.js >= 14.x
- npm >= 6.x
- Vue CLI >= 4.x

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run serve
```

### 构建生产环境
```bash
npm run build
```

### 运行测试
```bash
npm run test
```

## 贡献指南
1. Fork 本仓库。
2. 创建一个新的分支：`git checkout -b feature/your-feature-name`。
3. 提交代码：`git commit -m 'Add some feature'`。
4. 推送到远程分支：`git push origin feature/your-feature-name`。
5. 提交 Pull Request。

## 许可证
本项目基于 [MIT 许可证](./LICENSE) 开源。

## 联系方式
如有任何问题，请通过以下方式联系我们：
- 邮箱：748974300@qq.com
- 微信公众号：镜中观察

感谢您对 AutoPark 项目的支持！