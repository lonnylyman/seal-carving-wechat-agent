# 篆刻设计小助手 - API 认证方式详细说明

## 📌 概述

篆刻设计小助手 API 使用 **JWT (JSON Web Token)** 认证方式,采用 Bearer Token 模式。所有需要认证的API请求都需要在请求头中包含有效的 JWT Token。

---

## 🔐 认证流程

```
┌─────────────────┐
│  微信小程序      │
└────────┬────────┘
         │ 1. wx.login() 获取授权码
         ↓
┌─────────────────────────────────────────┐
│  /api/auth/login                        │
│  - 发送授权码                            │
│  - 调用微信API验证                       │
│  - 创建或更新用户                        │
│  - 生成 JWT Token                        │
└────────┬────────────────────────────────┘
         │ 2. 返回 Token
         ↓
┌─────────────────┐
│  本地存储 Token  │  (wx.setStorageSync)
└────────┬────────┘
         │ 3. 后续请求附加 Token
         ↓
┌──────────────────────────────────────────┐
│  其他 API 端点                            │
│  Authorization: Bearer <token>           │
│  - 验证 Token 有效性                     │
│  - 提取用户信息                          │
│  - 执行业务逻辑                          │
└──────────────────────────────────────────┘
```

---

## 🔑 JWT Token 详解

### Token 结构

JWT Token 由三部分组成,用 `.` 分隔:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm9wZW5pZCI6Im9YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYSIsImlhdCI6MTY3MzQyMzQwMCwiZXhwIjoxNjc0MDI4MjAwfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

┌─────────────────────────────────────────────────────────────────┐
│ Header (头部)                                                    │
│ {"alg":"HS256","typ":"JWT"}                                    │
│ - 指定加密算法和Token类型                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Payload (载荷)                                                   │
│ {                                                               │
│   "userId": 1,                                                  │
│   "openid": "oXXXXXXXXXXXXXXXXXXXXXXXXXXX",                     │
│   "iat": 1673423400,                                            │
│   "exp": 1674028200                                             │
│ }                                                               │
│ - 包含用户信息和过期时间                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Signature (签名)                                                 │
│ HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
│ - 使用服务器密钥签名,防止篡改                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Token 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `userId` | 用户ID | `1` |
| `openid` | 微信用户唯一标识 | `oXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `iat` | Token 签发时间(Unix时间戳) | `1673423400` |
| `exp` | Token 过期时间(Unix时间戳) | `1674028200` |

### Token 有效期

- **默认有效期:** 7 天
- **过期后:** 需要重新登录获取新的 Token

---

## 🚀 使用 Token 的方式

### 方式 1: Authorization 请求头 (推荐)

在所有需要认证的请求中,在 `Authorization` 请求头中添加 Token:

```http
GET /api/auth/user HTTP/1.1
Host: seal-carving-wechat-agent-cri8.vercel.app
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**格式:** `Authorization: Bearer <token>`

**说明:**
- `Bearer` 是固定前缀
- 后面跟一个空格
- 然后是完整的 JWT Token

### 方式 2: 查询参数

也可以通过 URL 查询参数传递 Token (不推荐,安全性较低):

```
GET /api/auth/user?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注意:** 不推荐使用此方式,因为:
- Token 会被记录在服务器日志中
- Token 可能被浏览器历史记录保存
- 容易被中间人攻击

---

## 📱 微信小程序实现

### 步骤 1: 获取 Token (登录)

```javascript
// pages/login/login.js

Page({
  onLoad() {
    this.login();
  },

  login() {
    // 第一步: 获取微信授权码
    wx.login({
      success: (res) => {
        const code = res.code;
        console.log('授权码:', code);

        // 第二步: 发送授权码到后端
        wx.request({
          url: 'https://seal-carving-wechat-agent-cri8.vercel.app/api/auth/login',
          method: 'POST',
          data: { code },
          success: (res) => {
            if (res.data.code === 0) {
              // 第三步: 保存 Token
              const { token, user } = res.data.data;
              
              wx.setStorageSync('authToken', token);
              wx.setStorageSync('userInfo', user);
              
              console.log('登录成功:', user);
              
              // 第四步: 跳转到首页
              wx.navigateTo({ url: '/pages/index/index' });
            } else {
              wx.showToast({
                title: res.data.message || '登录失败',
                icon: 'error'
              });
            }
          },
          fail: (error) => {
            console.error('登录请求失败:', error);
            wx.showToast({
              title: '网络错误',
              icon: 'error'
            });
          }
        });
      },
      fail: (error) => {
        console.error('获取授权码失败:', error);
        wx.showToast({
          title: '登录失败',
          icon: 'error'
        });
      }
    });
  }
});
```

### 步骤 2: 使用 Token 发送请求

```javascript
// 创建一个通用的 API 请求函数

// utils/api.js

const API_BASE_URL = 'https://seal-carving-wechat-agent-cri8.vercel.app';

/**
 * 发送 API 请求
 * @param {string} method - HTTP 方法 (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API 端点 (例如: /api/designs)
 * @param {object} data - 请求数据
 * @param {boolean} requireAuth - 是否需要认证 (默认 true)
 */
export function request(method, endpoint, data = {}, requireAuth = true) {
  return new Promise((resolve, reject) => {
    const header = {
      'Content-Type': 'application/json'
    };

    // 如果需要认证,添加 Authorization 请求头
    if (requireAuth) {
      const token = wx.getStorageSync('authToken');
      
      if (!token) {
        // Token 不存在,需要重新登录
        wx.navigateTo({ url: '/pages/login/login' });
        reject(new Error('未登录'));
        return;
      }

      header['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: `${API_BASE_URL}${endpoint}`,
      method,
      header,
      data,
      success: (res) => {
        if (res.data.code === 0) {
          // 请求成功
          resolve(res.data.data);
        } else if (res.data.code === 401) {
          // Token 过期或无效,需要重新登录
          wx.removeStorageSync('authToken');
          wx.removeStorageSync('userInfo');
          wx.navigateTo({ url: '/pages/login/login' });
          reject(new Error('Token 已过期,请重新登录'));
        } else {
          // 其他错误
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (error) => {
        console.error('请求失败:', error);
        reject(error);
      }
    });
  });
}

// 导出便捷方法
export const api = {
  get: (endpoint, requireAuth = true) => request('GET', endpoint, {}, requireAuth),
  post: (endpoint, data, requireAuth = true) => request('POST', endpoint, data, requireAuth),
  put: (endpoint, data, requireAuth = true) => request('PUT', endpoint, data, requireAuth),
  delete: (endpoint, requireAuth = true) => request('DELETE', endpoint, {}, requireAuth),
};
```

### 步骤 3: 在页面中使用

```javascript
// pages/designs/list.js

import { api } from '../../utils/api.js';

Page({
  data: {
    designs: [],
    loading: false
  },

  onLoad() {
    this.getDesigns();
  },

  async getDesigns() {
    this.setData({ loading: true });

    try {
      // 使用 API 工具函数,自动处理 Token
      const designs = await api.get('/api/designs');
      this.setData({ designs });
    } catch (error) {
      console.error('获取设计列表失败:', error);
      wx.showToast({
        title: error.message || '获取失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async createDesign() {
    try {
      const result = await api.post('/api/designs', {
        title: '我的设计',
        imageUrl: 'https://...',
        style: '小篆',
        characters: '篆刻'
      });
      
      console.log('设计创建成功:', result);
      this.getDesigns(); // 刷新列表
    } catch (error) {
      wx.showToast({
        title: error.message || '创建失败',
        icon: 'error'
      });
    }
  },

  async favoriteDesign(designId) {
    try {
      await api.post(`/api/designs/${designId}/favorite`);
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '收藏失败',
        icon: 'error'
      });
    }
  }
});
```

---

## ⚠️ Token 过期处理

### 问题描述

Token 有 7 天的有效期。过期后,API 会返回 401 错误。

### 解决方案

#### 方案 1: 自动重新登录 (推荐)

```javascript
// utils/api.js

export function request(method, endpoint, data = {}, requireAuth = true) {
  return new Promise((resolve, reject) => {
    const header = {
      'Content-Type': 'application/json'
    };

    if (requireAuth) {
      const token = wx.getStorageSync('authToken');
      
      if (!token) {
        // 没有 Token,需要登录
        handleTokenExpired();
        reject(new Error('未登录'));
        return;
      }

      header['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: `${API_BASE_URL}${endpoint}`,
      method,
      header,
      data,
      success: (res) => {
        if (res.data.code === 401) {
          // Token 过期
          handleTokenExpired();
          reject(new Error('Token 已过期'));
        } else if (res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message));
        }
      },
      fail: reject
    });
  });
}

/**
 * 处理 Token 过期
 */
function handleTokenExpired() {
  // 清除本地存储
  wx.removeStorageSync('authToken');
  wx.removeStorageSync('userInfo');

  // 显示提示
  wx.showToast({
    title: '登录已过期,请重新登录',
    icon: 'none',
    duration: 2000
  });

  // 延迟后跳转到登录页
  setTimeout(() => {
    wx.navigateTo({ url: '/pages/login/login' });
  }, 2000);
}
```

#### 方案 2: 手动刷新 Token (可选)

如果需要实现"刷新 Token"功能,后端可以提供一个刷新端点:

```javascript
// 刷新 Token
async function refreshToken() {
  const oldToken = wx.getStorageSync('authToken');
  
  try {
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE_URL}/api/auth/refresh`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${oldToken}`
        },
        success: resolve,
        fail: reject
      });
    });

    if (response.data.code === 0) {
      const newToken = response.data.data.token;
      wx.setStorageSync('authToken', newToken);
      return newToken;
    }
  } catch (error) {
    handleTokenExpired();
  }
}
```

---

## 🔒 安全最佳实践

### 1. 安全存储 Token

✅ **推荐:**
```javascript
// 使用 wx.setStorageSync 存储在本地存储
wx.setStorageSync('authToken', token);
```

❌ **不推荐:**
```javascript
// 不要存储在全局变量中
app.globalData.token = token; // 容易被清空

// 不要存储在 URL 中
// 不要存储在 Cookie 中 (微信小程序不支持)
```

### 2. 安全传输 Token

✅ **推荐:**
```javascript
// 使用 HTTPS 传输
header['Authorization'] = `Bearer ${token}`;
```

❌ **不推荐:**
```javascript
// 不要通过 URL 参数传输
url: `${API_BASE_URL}/api/designs?token=${token}`

// 不要通过 POST Body 传输 (除非特殊情况)
```

### 3. Token 有效期检查

```javascript
/**
 * 检查 Token 是否即将过期
 * @param {string} token - JWT Token
 * @param {number} warningTime - 警告时间(秒),默认 3600(1小时)
 */
function isTokenExpiringSoon(token, warningTime = 3600) {
  try {
    // 解析 JWT 的 Payload 部分
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - now;
    
    return expiresIn < warningTime;
  } catch (error) {
    console.error('解析 Token 失败:', error);
    return true; // 解析失败,认为已过期
  }
}

// 使用示例
const token = wx.getStorageSync('authToken');
if (isTokenExpiringSoon(token)) {
  console.warn('Token 即将过期,建议重新登录');
  // 可以选择主动刷新或提示用户
}
```

### 4. 错误处理

```javascript
/**
 * 统一的错误处理
 */
function handleApiError(error) {
  if (error.response) {
    // 服务器返回了错误响应
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        console.error('请求参数错误:', data.message);
        break;
      case 401:
        console.error('认证失败,需要重新登录');
        handleTokenExpired();
        break;
      case 403:
        console.error('无权限访问此资源');
        break;
      case 404:
        console.error('资源不存在');
        break;
      case 500:
        console.error('服务器错误');
        break;
      default:
        console.error('未知错误:', data.message);
    }
  } else if (error.request) {
    // 请求已发送但没有收到响应
    console.error('网络错误,请检查网络连接');
  } else {
    // 其他错误
    console.error('错误:', error.message);
  }
}
```

---

## 📊 认证流程图

```
用户打开小程序
    ↓
检查本地是否有 Token
    ↓
┌─── 有 Token ───┐
│               │
↓               ↓
验证 Token      使用 Token
有效?           发送请求
│               │
├─ 是 ──→ 继续使用
│
└─ 否 ──→ 删除 Token
         ↓
      显示登录页
         ↓
    用户点击登录
         ↓
    wx.login()
         ↓
    获取授权码
         ↓
    POST /api/auth/login
         ↓
    后端验证授权码
         ↓
    创建/更新用户
         ↓
    生成 JWT Token
         ↓
    返回 Token
         ↓
    保存 Token 到本地
         ↓
    跳转到首页
         ↓
    使用 Token 发送请求
```

---

## 🧪 测试认证

### 使用 cURL 测试

```bash
# 1. 登录(需要真实的微信授权码)
curl -X POST https://seal-carving-wechat-agent-cri8.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"WECHAT_AUTH_CODE"}'

# 响应:
# {
#   "code": 0,
#   "message": "登录成功",
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": {...}
#   }
# }

# 2. 使用 Token 获取用户信息
curl -X GET https://seal-carving-wechat-agent-cri8.vercel.app/api/auth/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 响应:
# {
#   "code": 0,
#   "message": "获取成功",
#   "data": {...}
# }

# 3. 测试无效 Token
curl -X GET https://seal-carving-wechat-agent-cri8.vercel.app/api/auth/user \
  -H "Authorization: Bearer invalid_token"

# 响应:
# {
#   "code": 401,
#   "message": "认证失败"
# }
```

### 使用 Postman 测试

1. 打开 Postman
2. 创建新请求
3. 设置方法为 `GET`
4. 输入 URL: `https://seal-carving-wechat-agent-cri8.vercel.app/api/auth/user`
5. 在 `Headers` 标签中添加:
   - Key: `Authorization`
   - Value: `Bearer <your_token>`
6. 点击 `Send`

---

## 📞 常见问题

**Q: 如何在微信小程序中获取授权码?**
A: 使用 `wx.login()` 方法,它会返回一个授权码。

**Q: Token 过期后怎么办?**
A: 清除本地 Token,重新调用登录接口获取新的 Token。

**Q: 可以在多个设备上使用同一个 Token 吗?**
A: 可以,但不推荐。建议每个设备独立登录获取自己的 Token。

**Q: 如何注销登录?**
A: 清除本地存储的 Token 即可:
```javascript
wx.removeStorageSync('authToken');
wx.removeStorageSync('userInfo');
```

**Q: Token 可以手动延期吗?**
A: 不可以。需要重新登录获取新的 Token。

---

## 📚 相关资源

- [JWT 官方网站](https://jwt.io)
- [微信小程序 wx.login 文档](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html)
- [微信小程序 wx.request 文档](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)

---

**最后更新:** 2026-01-11  
**API 版本:** 1.0.0
