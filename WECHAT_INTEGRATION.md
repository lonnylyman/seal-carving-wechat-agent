# 篆刻设计小助手 - 微信小程序集成指南 (详细版)

## 📌 目录

1. [环境准备](#环境准备)
2. [项目结构](#项目结构)
3. [基础配置](#基础配置)
4. [API 工具函数](#api-工具函数)
5. [登录流程](#登录流程)
6. [核心功能实现](#核心功能实现)
7. [错误处理](#错误处理)
8. [性能优化](#性能优化)
9. [调试技巧](#调试技巧)
10. [常见问题](#常见问题)

---

## 🛠️ 环境准备

### 前置要求

- **微信开发者工具** - 最新版本
- **微信小程序账号** - 已认证
- **Node.js** - 用于本地开发 (可选)
- **代码编辑器** - VS Code 推荐

### 创建微信小程序项目

1. 打开微信开发者工具
2. 点击 "新建项目"
3. 填写项目信息:
   - **项目名称:** 篆刻设计小助手
   - **项目目录:** 选择本地目录
   - **AppID:** 使用测试号 (开发阶段)
   - **后端服务:** 不使用云开发
4. 点击 "新建"

### 获取 AppID

对于正式发布,需要使用真实的 AppID:

1. 访问 [微信公众平台](https://mp.weixin.qq.com)
2. 登录小程序账号
3. 进入 "设置" → "开发设置"
4. 复制 **AppID** 和 **AppSecret**

**本项目的 AppID:**
```
wx5a4e1183cb6cadbb
```

---

## 📁 项目结构

推荐的微信小程序项目结构:

```
seal-carving-miniprogram/
├── pages/                          # 页面目录
│   ├── index/                      # 首页
│   │   ├── index.wxml             # 页面结构
│   │   ├── index.wxss             # 页面样式
│   │   ├── index.js               # 页面逻辑
│   │   └── index.json             # 页面配置
│   ├── login/                      # 登录页
│   │   ├── login.wxml
│   │   ├── login.wxss
│   │   ├── login.js
│   │   └── login.json
│   ├── designs/                    # 设计列表页
│   │   ├── list.wxml
│   │   ├── list.wxss
│   │   ├── list.js
│   │   └── list.json
│   ├── design-detail/              # 设计详情页
│   │   ├── detail.wxml
│   │   ├── detail.wxss
│   │   ├── detail.js
│   │   └── detail.json
│   └── design-create/              # 创建设计页
│       ├── create.wxml
│       ├── create.wxss
│       ├── create.js
│       └── create.json
├── components/                     # 自定义组件
│   ├── design-card/               # 设计卡片组件
│   │   ├── design-card.wxml
│   │   ├── design-card.wxss
│   │   ├── design-card.js
│   │   └── design-card.json
│   └── loading/                    # 加载组件
│       ├── loading.wxml
│       ├── loading.wxss
│       ├── loading.js
│       └── loading.json
├── utils/                          # 工具函数
│   ├── api.js                      # API 请求工具
│   ├── storage.js                  # 本地存储工具
│   ├── validate.js                 # 数据验证工具
│   └── config.js                   # 配置文件
├── assets/                         # 资源文件
│   ├── images/                     # 图片
│   ├── icons/                      # 图标
│   └── fonts/                      # 字体
├── app.js                          # 应用入口
├── app.json                        # 应用配置
├── app.wxss                        # 全局样式
├── project.config.json             # 项目配置
└── README.md                       # 项目说明
```

---

## ⚙️ 基础配置

### app.json - 应用配置

```json
{
  "pages": [
    "pages/index/index",
    "pages/login/login",
    "pages/designs/list",
    "pages/design-detail/detail",
    "pages/design-create/create"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "篆刻设计小助手",
    "navigationBarTextStyle": "black",
    "enablePullDownRefresh": true,
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#d4af37",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "assets/icons/home.png",
        "selectedIconPath": "assets/icons/home-selected.png"
      },
      {
        "pagePath": "pages/designs/list",
        "text": "我的设计",
        "iconPath": "assets/icons/design.png",
        "selectedIconPath": "assets/icons/design-selected.png"
      },
      {
        "pagePath": "pages/login/login",
        "text": "我的",
        "iconPath": "assets/icons/user.png",
        "selectedIconPath": "assets/icons/user-selected.png"
      }
    ]
  },
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": false,
  "permission": {
    "scope.userInfo": {
      "desc": "用于获取您的昵称、头像等信息"
    }
  }
}
```

### utils/config.js - 配置文件

```javascript
// utils/config.js

/**
 * 应用配置
 */

// API 基础 URL
export const API_BASE_URL = 'https://seal-carving-wechat-agent-cri8.vercel.app';

// 微信小程序配置
export const WECHAT_CONFIG = {
  appId: 'wx5a4e1183cb6cadbb',
  appSecret: '2853c002b8cc5e1d411eceb5f8499e2b'
};

// 本地存储 Key
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_INFO: 'userInfo',
  FAVORITES: 'favorites',
  HISTORY: 'history'
};

// API 超时时间 (毫秒)
export const API_TIMEOUT = 10000;

// 分页配置
export const PAGINATION = {
  PAGE_SIZE: 20,
  DEFAULT_PAGE: 1
};

// 图片上传配置
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

// 篆刻风格列表
export const SEAL_STYLES = [
  { value: 'large-seal', label: '大篆' },
  { value: 'small-seal', label: '小篆' },
  { value: 'clerical', label: '隶书' },
  { value: 'cursive', label: '草书' },
  { value: 'regular', label: '楷书' }
];

// 开发环境标志
export const IS_DEV = false; // 改为 true 可启用调试模式
```

### utils/storage.js - 本地存储工具

```javascript
// utils/storage.js

import { STORAGE_KEYS } from './config.js';

/**
 * 本地存储工具类
 */
class StorageManager {
  /**
   * 设置值
   */
  set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (error) {
      console.error(`设置存储失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 获取值
   */
  get(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key);
      return value || defaultValue;
    } catch (error) {
      console.error(`获取存储失败 [${key}]:`, error);
      return defaultValue;
    }
  }

  /**
   * 删除值
   */
  remove(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (error) {
      console.error(`删除存储失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 清空所有存储
   */
  clear() {
    try {
      wx.clearStorageSync();
      return true;
    } catch (error) {
      console.error('清空存储失败:', error);
      return false;
    }
  }

  // 便捷方法
  getToken() {
    return this.get(STORAGE_KEYS.AUTH_TOKEN);
  }

  setToken(token) {
    return this.set(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  removeToken() {
    return this.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  getUserInfo() {
    return this.get(STORAGE_KEYS.USER_INFO, {});
  }

  setUserInfo(userInfo) {
    return this.set(STORAGE_KEYS.USER_INFO, userInfo);
  }

  getFavorites() {
    return this.get(STORAGE_KEYS.FAVORITES, []);
  }

  setFavorites(favorites) {
    return this.set(STORAGE_KEYS.FAVORITES, favorites);
  }

  getHistory() {
    return this.get(STORAGE_KEYS.HISTORY, []);
  }

  setHistory(history) {
    return this.set(STORAGE_KEYS.HISTORY, history);
  }
}

export default new StorageManager();
```

---

## 🔌 API 工具函数

### utils/api.js - 完整的 API 请求工具

```javascript
// utils/api.js

import { API_BASE_URL, API_TIMEOUT } from './config.js';
import storage from './storage.js';

/**
 * API 请求工具类
 */
class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.timeout = API_TIMEOUT;
    this.requestQueue = [];
    this.isRequesting = false;
  }

  /**
   * 发送 HTTP 请求
   */
  request(method, endpoint, data = {}, options = {}) {
    return new Promise((resolve, reject) => {
      const {
        requireAuth = true,
        showLoading = true,
        retryCount = 0
      } = options;

      // 显示加载提示
      if (showLoading) {
        wx.showLoading({ title: '加载中...' });
      }

      // 构建请求头
      const header = {
        'Content-Type': 'application/json'
      };

      // 如果需要认证,添加 Token
      if (requireAuth) {
        const token = storage.getToken();
        if (!token) {
          wx.hideLoading();
          this.handleUnauthorized();
          reject(new Error('未登录'));
          return;
        }
        header['Authorization'] = `Bearer ${token}`;
      }

      // 发送请求
      wx.request({
        url: `${this.baseUrl}${endpoint}`,
        method,
        header,
        data,
        timeout: this.timeout,
        success: (res) => {
          wx.hideLoading();

          const { statusCode, data: responseData } = res;

          // 处理响应
          if (statusCode === 200) {
            if (responseData.code === 0) {
              // 请求成功
              resolve(responseData.data);
            } else if (responseData.code === 401) {
              // Token 过期或无效
              this.handleUnauthorized();
              reject(new Error('认证失败'));
            } else {
              // 业务错误
              reject(new Error(responseData.message || '请求失败'));
            }
          } else if (statusCode === 401) {
            // HTTP 401 错误
            this.handleUnauthorized();
            reject(new Error('认证失败'));
          } else if (statusCode === 404) {
            reject(new Error('资源不存在'));
          } else if (statusCode === 500) {
            reject(new Error('服务器错误'));
          } else {
            reject(new Error(`HTTP ${statusCode} 错误`));
          }
        },
        fail: (error) => {
          wx.hideLoading();

          // 网络错误重试
          if (retryCount < 2) {
            console.warn(`请求失败,准备重试 (${retryCount + 1}/2)...`);
            setTimeout(() => {
              this.request(method, endpoint, data, {
                ...options,
                retryCount: retryCount + 1
              }).then(resolve).catch(reject);
            }, 1000);
          } else {
            reject(new Error('网络错误,请检查网络连接'));
          }
        }
      });
    });
  }

  /**
   * 处理未授权 (Token 过期)
   */
  handleUnauthorized() {
    // 清除本地 Token
    storage.removeToken();
    storage.removeUserInfo();

    // 显示提示
    wx.showToast({
      title: '登录已过期,请重新登录',
      icon: 'none',
      duration: 2000
    });

    // 跳转到登录页
    setTimeout(() => {
      wx.navigateTo({ url: '/pages/login/login' });
    }, 2000);
  }

  // 便捷方法
  get(endpoint, options = {}) {
    return this.request('GET', endpoint, {}, options);
  }

  post(endpoint, data = {}, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  put(endpoint, data = {}, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, {}, options);
  }
}

// 导出单例
export default new ApiClient();

// 导出便捷函数
export const api = {
  get: (endpoint, options) => new ApiClient().get(endpoint, options),
  post: (endpoint, data, options) => new ApiClient().post(endpoint, data, options),
  put: (endpoint, data, options) => new ApiClient().put(endpoint, data, options),
  delete: (endpoint, options) => new ApiClient().delete(endpoint, options),
};
```

---

## 🔐 登录流程

### pages/login/login.js - 完整的登录页

```javascript
// pages/login/login.js

import apiClient from '../../utils/api.js';
import storage from '../../utils/storage.js';

Page({
  data: {
    loading: false,
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUseGetUserProfile(),
  },

  onLoad() {
    // 检查是否已登录
    this.checkLogin();
  },

  /**
   * 检查登录状态
   */
  checkLogin() {
    const token = storage.getToken();
    if (token) {
      // 已登录,跳转到首页
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  /**
   * 微信登录
   */
  async onLogin() {
    this.setData({ loading: true });

    try {
      // 第一步: 获取授权码
      const { code } = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });

      console.log('授权码:', code);

      // 第二步: 调用后端登录 API
      const result = await apiClient.post('/api/auth/login', { code }, {
        requireAuth: false,
        showLoading: true
      });

      console.log('登录成功:', result);

      // 第三步: 保存 Token 和用户信息
      storage.setToken(result.token);
      storage.setUserInfo(result.user);

      // 第四步: 显示成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });

      // 第五步: 跳转到首页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);

    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 注销登录
   */
  onLogout() {
    wx.showModal({
      title: '确认注销',
      content: '确定要注销登录吗?',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          storage.removeToken();
          storage.removeUserInfo();
          this.setData({ hasUserInfo: false });
          wx.showToast({
            title: '已注销',
            icon: 'success'
          });
        }
      }
    });
  }
});
```

### pages/login/login.wxml - 登录页面

```xml
<!-- pages/login/login.wxml -->

<view class="container">
  <!-- 标题 -->
  <view class="header">
    <text class="title">篆刻设计小助手</text>
    <text class="subtitle">传承传统文化,创意篆刻设计</text>
  </view>

  <!-- 登录按钮 -->
  <view class="login-section">
    <button 
      class="login-btn" 
      type="primary" 
      loading="{{loading}}"
      disabled="{{loading}}"
      bindtap="onLogin"
    >
      <text wx:if="{{!loading}}">微信登录</text>
      <text wx:else>登录中...</text>
    </button>
    <text class="tips">点击登录即表示同意《用户协议》和《隐私政策》</text>
  </view>

  <!-- 功能介绍 -->
  <view class="features">
    <view class="feature-item">
      <text class="feature-icon">🎨</text>
      <text class="feature-title">AI 篆刻设计</text>
      <text class="feature-desc">智能生成独特的篆刻图案</text>
    </view>
    <view class="feature-item">
      <text class="feature-icon">❤️</text>
      <text class="feature-title">收藏管理</text>
      <text class="feature-desc">保存喜爱的设计作品</text>
    </view>
    <view class="feature-item">
      <text class="feature-icon">📚</text>
      <text class="feature-title">设计库</text>
      <text class="feature-desc">浏览海量篆刻设计模板</text>
    </view>
  </view>
</view>
```

### pages/login/login.wxss - 登录页样式

```css
/* pages/login/login.wxss */

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
  color: white;
}

.title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.login-section {
  width: 100%;
  max-width: 300px;
  margin-bottom: 40px;
}

.login-btn {
  width: 100%;
  height: 50px;
  background-color: #d4af37 !important;
  color: #333 !important;
  font-weight: bold;
  border-radius: 25px;
  font-size: 16px;
}

.login-btn::after {
  border: none;
}

.tips {
  display: block;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 15px;
}

.features {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  gap: 15px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  backdrop-filter: blur(10px);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.feature-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.feature-desc {
  font-size: 12px;
  opacity: 0.8;
  text-align: center;
}
```

---

## 🎨 核心功能实现

### 1. 获取设计列表

```javascript
// pages/designs/list.js

import apiClient from '../../utils/api.js';
import storage from '../../utils/storage.js';

Page({
  data: {
    designs: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.getDesigns();
  },

  /**
   * 获取设计列表
   */
  async getDesigns() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const result = await apiClient.get('/api/designs', {
        requireAuth: true,
        showLoading: true
      });

      this.setData({
        designs: result || [],
        hasMore: result && result.length >= this.data.pageSize
      });
    } catch (error) {
      console.error('获取设计列表失败:', error);
      wx.showToast({
        title: error.message || '获取失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ page: 1 });
    this.getDesigns();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.getDesigns();
    }
  }
});
```

### 2. 创建设计

```javascript
// pages/design-create/create.js

import apiClient from '../../utils/api.js';

Page({
  data: {
    title: '',
    description: '',
    imageUrl: '',
    style: 'small-seal',
    characters: '',
    loading: false
  },

  /**
   * 选择图片
   */
  onChooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 上传图片到服务器
        this.uploadImage(tempFilePath);
      }
    });
  },

  /**
   * 上传图片
   */
  uploadImage(filePath) {
    wx.showLoading({ title: '上传中...' });

    // 这里需要实现图片上传逻辑
    // 可以上传到阿里云、腾讯云等服务
    // 或者使用微信的云开发功能

    // 示例: 上传到自定义服务器
    wx.uploadFile({
      url: 'https://your-upload-server.com/upload',
      filePath: filePath,
      name: 'file',
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          this.setData({ imageUrl: data.data.url });
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
        }
      },
      fail: (error) => {
        wx.showToast({
          title: '上传失败',
          icon: 'error'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  /**
   * 提交设计
   */
  async onSubmit() {
    const { title, imageUrl, style, characters } = this.data;

    // 验证必填字段
    if (!title) {
      wx.showToast({
        title: '请输入设计标题',
        icon: 'error'
      });
      return;
    }

    if (!imageUrl) {
      wx.showToast({
        title: '请选择设计图片',
        icon: 'error'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      await apiClient.post('/api/designs', {
        title,
        description: this.data.description,
        imageUrl,
        style,
        characters
      }, {
        requireAuth: true,
        showLoading: true
      });

      wx.showToast({
        title: '创建成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      wx.showToast({
        title: error.message || '创建失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
```

### 3. 收藏设计

```javascript
// pages/design-detail/detail.js

import apiClient from '../../utils/api.js';

Page({
  data: {
    design: null,
    isFavorited: false,
    loading: false
  },

  onLoad(options) {
    const { id } = options;
    this.getDesignDetail(id);
  },

  /**
   * 获取设计详情
   */
  async getDesignDetail(id) {
    this.setData({ loading: true });

    try {
      const design = await apiClient.get(`/api/designs/${id}`, {
        requireAuth: false,
        showLoading: true
      });

      this.setData({ design });
    } catch (error) {
      wx.showToast({
        title: error.message || '获取失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 收藏设计
   */
  async onFavorite() {
    const { design, isFavorited } = this.data;

    try {
      if (isFavorited) {
        // 取消收藏
        await apiClient.delete(`/api/designs/${design.id}/favorite`, {
          requireAuth: true
        });
        this.setData({ isFavorited: false });
        wx.showToast({
          title: '已取消收藏',
          icon: 'success'
        });
      } else {
        // 收藏
        await apiClient.post(`/api/designs/${design.id}/favorite`, {}, {
          requireAuth: true
        });
        this.setData({ isFavorited: true });
        wx.showToast({
          title: '收藏成功',
          icon: 'success'
        });
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'error'
      });
    }
  }
});
```

---

## 🚨 错误处理

### 统一的错误处理机制

```javascript
// utils/error-handler.js

/**
 * 错误处理工具
 */
class ErrorHandler {
  /**
   * 处理 API 错误
   */
  static handleApiError(error) {
    console.error('API 错误:', error);

    const message = error.message || '未知错误';

    // 根据错误类型显示不同的提示
    if (message.includes('网络')) {
      return '网络连接失败,请检查网络';
    } else if (message.includes('认证')) {
      return '认证失败,请重新登录';
    } else if (message.includes('不存在')) {
      return '资源不存在';
    } else if (message.includes('服务器')) {
      return '服务器错误,请稍后重试';
    } else {
      return message;
    }
  }

  /**
   * 显示错误提示
   */
  static showError(error, title = '错误') {
    const message = this.handleApiError(error);
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    });
  }

  /**
   * 记录错误日志
   */
  static logError(error, context = '') {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      stack: error.stack
    };

    console.error('错误日志:', errorInfo);

    // 可以将错误发送到服务器进行监控
    // this.reportError(errorInfo);
  }
}

export default ErrorHandler;
```

---

## ⚡ 性能优化

### 1. 图片懒加载

```javascript
// components/design-card/design-card.js

Component({
  properties: {
    design: Object
  },

  data: {
    imageLoaded: false
  },

  methods: {
    onImageLoad() {
      this.setData({ imageLoaded: true });
    },

    onImageError() {
      console.error('图片加载失败');
    }
  }
});
```

### 2. 列表虚拟化

```javascript
// 使用 wx:for 时添加 key 属性以优化性能
<view wx:for="{{designs}}" wx:key="id" class="design-item">
  <design-card design="{{item}}" />
</view>
```

### 3. 缓存管理

```javascript
// 缓存 API 响应
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheTime = 5 * 60 * 1000; // 5 分钟
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.cacheTime) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}
```

---

## 🔍 调试技巧

### 1. 启用调试模式

```javascript
// app.js

App({
  onLaunch() {
    // 启用调试日志
    if (process.env.NODE_ENV === 'development') {
      wx.setEnableDebug({
        enableDebug: true
      });
    }
  }
});
```

### 2. 使用控制台输出

```javascript
// 在微信开发者工具中查看日志
console.log('普通日志:', data);
console.warn('警告:', warning);
console.error('错误:', error);
```

### 3. 使用 wxml 调试

```xml
<!-- 在 wxml 中输出调试信息 -->
<view>{{design}}</view>
```

### 4. 网络调试

在微信开发者工具中:
1. 打开 "调试器"
2. 切换到 "Network" 标签
3. 查看所有网络请求

---

## ❓ 常见问题

### Q1: 如何处理图片上传?

**A:** 有两种方案:

1. **上传到第三方服务** (阿里云、腾讯云等)
2. **上传到自建服务器**

```javascript
// 示例: 上传到自建服务器
wx.uploadFile({
  url: 'https://your-server.com/upload',
  filePath: filePath,
  name: 'file',
  success(res) {
    const data = JSON.parse(res.data);
    console.log('上传成功:', data);
  }
});
```

### Q2: 如何实现下拉刷新?

**A:** 在 `page.json` 中启用,然后在 `onPullDownRefresh` 中处理:

```json
{
  "enablePullDownRefresh": true
}
```

```javascript
onPullDownRefresh() {
  this.getDesigns();
  // 完成后调用 wx.stopPullDownRefresh()
}
```

### Q3: 如何处理 Token 过期?

**A:** 在 API 工具中检查 401 错误并自动重新登录:

```javascript
if (responseData.code === 401) {
  storage.removeToken();
  wx.navigateTo({ url: '/pages/login/login' });
}
```

### Q4: 如何优化列表性能?

**A:** 使用以下方法:

1. 使用 `wx:key` 属性
2. 实现分页加载
3. 使用虚拟列表
4. 缓存数据

### Q5: 如何调试网络请求?

**A:** 使用微信开发者工具的 Network 标签查看所有请求和响应。

---

## 📚 完整示例项目

完整的示例项目可以在以下位置找到:

```
GitHub: https://github.com/lonnylyman/seal-carving-miniprogram
```

---

## 🎯 总结

集成步骤:

1. ✅ 创建微信小程序项目
2. ✅ 配置 `app.json` 和 `project.config.json`
3. ✅ 创建 API 工具函数
4. ✅ 实现登录流程
5. ✅ 实现核心功能 (设计列表、创建、收藏)
6. ✅ 添加错误处理
7. ✅ 优化性能
8. ✅ 测试和调试
9. ✅ 发布到微信小程序

---

**最后更新:** 2026-01-11  
**API 版本:** 1.0.0  
**微信小程序 SDK:** 最新版本
