# 篆刻设计小助手 - 微信小程序Agent后端

这是篆刻设计小助手微信小程序的后端服务,提供用户认证、设计管理、收藏、微信支付等功能。

## 功能特性

✨ **核心功能**
- 🔐 微信登录认证
- 🎨 篆刻设计管理(创建、编辑、删除)
- ❤️ 设计收藏功能
- 🔍 设计搜索和发现
- 💳 微信支付集成
- 👤 用户信息管理

## 技术栈

- **运行时:** Node.js 18+
- **框架:** Express.js 4.x
- **认证:** JWT (JSON Web Tokens)
- **语言:** TypeScript 5.x

## 快速开始

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env`:

```bash
cp .env.example .env
```

编辑 `.env` 文件,填写微信小程序配置:

```env
WECHAT_APPID=wx5a4e1183cb6cadbb
WECHAT_APPSECRET=2853c002b8cc5e1d411eceb5f8499e2b
JWT_SECRET=your-secret-key
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm start
```

## API 端点

### 认证
- `POST /api/auth/login` - 微信登录
- `GET /api/auth/user` - 获取用户信息
- `PUT /api/auth/user` - 更新用户信息

### 设计
- `POST /api/designs` - 创建设计
- `GET /api/designs` - 获取用户设计列表
- `GET /api/designs/:id` - 获取设计详情
- `DELETE /api/designs/:id` - 删除设计
- `POST /api/designs/:id/favorite` - 收藏设计
- `DELETE /api/designs/:id/favorite` - 取消收藏
- `GET /api/designs/public` - 获取公开设计

### 支付
- `POST /api/payment/orders` - 创建订单

## 部署

### Vercel部署

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 自动部署

## 许可证

MIT License
