# 篆刻设计小助手 - 微信小程序集成指南

## 🎯 快速开始

**API 基础 URL:** `https://seal-carving-wechat-agent-cri8.vercel.app`

**微信小程序配置:**
- AppID: `wx5a4e1183cb6cadbb`
- AppSecret: `2853c002b8cc5e1d411eceb5f8499e2b`

---

## 📋 API 端点列表

### 1. 认证 (Authentication)

#### 1.1 微信登录
```
POST /api/auth/login
Content-Type: application/json

请求体:
{
  "code": "微信授权码"
}

响应:
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "openid": "oXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "nickname": "用户1",
      "avatar": ""
    },
    "sessionKey": "XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }
}
```

#### 1.2 获取用户信息
```
GET /api/auth/user
Authorization: Bearer <token>

响应:
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 1,
    "openid": "oXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "nickname": "用户1",
    "avatar": "",
    "createdAt": "2026-01-11T17:00:00.000Z"
  }
}
```

#### 1.3 更新用户信息
```
PUT /api/auth/user
Authorization: Bearer <token>
Content-Type: application/json

请求体:
{
  "nickname": "新昵称",
  "avatar": "https://..."
}

响应:
{
  "code": 0,
  "message": "更新成功",
  "data": { ... }
}
```

---

### 2. 篆刻设计 (Designs)

#### 2.1 创建设计
```
POST /api/designs
Authorization: Bearer <token>
Content-Type: application/json

请求体:
{
  "title": "我的篆刻设计",
  "description": "这是一个篆刻设计",
  "imageUrl": "https://example.com/image.png",
  "style": "小篆",
  "characters": "篆刻内容"
}

响应:
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "我的篆刻设计",
    "description": "这是一个篆刻设计",
    "imageUrl": "https://example.com/image.png",
    "style": "小篆",
    "characters": "篆刻内容",
    "isPublic": false,
    "viewCount": 0,
    "createdAt": "2026-01-11T17:00:00.000Z"
  }
}
```

#### 2.2 获取用户设计列表
```
GET /api/designs
Authorization: Bearer <token>

响应:
{
  "code": 0,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "我的篆刻设计",
      ...
    }
  ]
}
```

#### 2.3 获取设计详情
```
GET /api/designs/:id

响应:
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "我的篆刻设计",
    "viewCount": 5,
    ...
  }
}
```

#### 2.4 删除设计
```
DELETE /api/designs/:id
Authorization: Bearer <token>

响应:
{
  "code": 0,
  "message": "删除成功"
}
```

#### 2.5 收藏设计
```
POST /api/designs/:id/favorite
Authorization: Bearer <token>

响应:
{
  "code": 0,
  "message": "收藏成功"
}
```

#### 2.6 取消收藏
```
DELETE /api/designs/:id/favorite
Authorization: Bearer <token>

响应:
{
  "code": 0,
  "message": "取消收藏成功"
}
```

#### 2.7 获取公开设计
```
GET /api/designs/public

响应:
{
  "code": 0,
  "message": "获取成功",
  "data": [...]
}
```

---

### 3. 支付 (Payment)

#### 3.1 创建订单
```
POST /api/payment/orders
Authorization: Bearer <token>
Content-Type: application/json

请求体:
{
  "amount": 9.99,
  "description": "购买高级功能"
}

响应:
{
  "code": 0,
  "message": "订单创建成功",
  "data": {
    "order": {
      "id": 1,
      "userId": 1,
      "amount": 9.99,
      "description": "购买高级功能",
      "status": "pending",
      "createdAt": "2026-01-11T17:00:00.000Z"
    },
    "payment": {
      "prepayId": "wx...",
      "timeStamp": "1234567890",
      "nonceStr": "abc123",
      "package": "prepay_id=wx...",
      "signType": "RSA"
    }
  }
}
```

---

## 💻 微信小程序代码示例

### 1. 登录流程

```javascript
// pages/login/login.js

Page({
  onLoad() {
    this.login();
  },

  login() {
    wx.login({
      success: (res) => {
        const code = res.code;
        
        // 调用后端登录API
        wx.request({
          url: 'https://seal-carving-wechat-agent-cri8.vercel.app/api/auth/login',
          method: 'POST',
          data: { code },
          success: (res) => {
            if (res.data.code === 0) {
              const { token, user } = res.data.data;
              
              // 保存token和用户信息
              wx.setStorageSync('authToken', token);
              wx.setStorageSync('userInfo', user);
              
              // 跳转到首页
              wx.navigateTo({ url: '/pages/index/index' });
            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'error'
              });
            }
          },
          fail: (error) => {
            wx.showToast({
              title: '登录失败',
              icon: 'error'
            });
          }
        });
      }
    });
  }
});
```

### 2. 创建设计

```javascript
// pages/design/create.js

Page({
  data: {
    title: '',
    description: '',
    imageUrl: '',
    style: '小篆',
    characters: ''
  },

  onSubmit() {
    const { title, description, imageUrl, style, characters } = this.data;
    
    if (!title || !imageUrl) {
      wx.showToast({
        title: '请填写必要信息',
        icon: 'error'
      });
      return;
    }

    const token = wx.getStorageSync('authToken');

    wx.request({
      url: 'https://seal-carving-wechat-agent-cri8.vercel.app/api/designs',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        title,
        description,
        imageUrl,
        style,
        characters
      },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '创建成功',
            icon: 'success'
          });
          wx.navigateBack();
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'error'
          });
        }
      },
      fail: (error) => {
        wx.showToast({
          title: '创建失败',
          icon: 'error'
        });
      }
    });
  }
});
```

### 3. 获取设计列表

```javascript
// pages/designs/list.js

Page({
  data: {
    designs: [],
    loading: false
  },

  onLoad() {
    this.getDesigns();
  },

  getDesigns() {
    this.setData({ loading: true });
    
    const token = wx.getStorageSync('authToken');

    wx.request({
      url: 'https://seal-carving-wechat-agent-cri8.vercel.app/api/designs',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ designs: res.data.data });
        }
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  onRefresh() {
    this.getDesigns();
  }
});
```

### 4. 收藏设计

```javascript
// 收藏设计
favoriteDesign(designId) {
  const token = wx.getStorageSync('authToken');

  wx.request({
    url: `https://seal-carving-wechat-agent-cri8.vercel.app/api/designs/${designId}/favorite`,
    method: 'POST',
    header: {
      'Authorization': `Bearer ${token}`
    },
    success: (res) => {
      if (res.data.code === 0) {
        wx.showToast({
          title: '收藏成功',
          icon: 'success'
        });
      }
    }
  });
}

// 取消收藏
unfavoriteDesign(designId) {
  const token = wx.getStorageSync('authToken');

  wx.request({
    url: `https://seal-carving-wechat-agent-cri8.vercel.app/api/designs/${designId}/favorite`,
    method: 'DELETE',
    header: {
      'Authorization': `Bearer ${token}`
    },
    success: (res) => {
      if (res.data.code === 0) {
        wx.showToast({
          title: '取消收藏成功',
          icon: 'success'
        });
      }
    }
  });
}
```

### 5. 创建订单(支付)

```javascript
// pages/payment/create-order.js

Page({
  data: {
    amount: 9.99,
    description: '购买高级功能'
  },

  createOrder() {
    const token = wx.getStorageSync('authToken');
    const { amount, description } = this.data;

    wx.request({
      url: 'https://seal-carving-wechat-agent-cri8.vercel.app/api/payment/orders',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        amount,
        description
      },
      success: (res) => {
        if (res.data.code === 0) {
          const { payment } = res.data.data;
          
          // 调用微信支付
          wx.requestPayment({
            timeStamp: payment.timeStamp,
            nonceStr: payment.nonceStr,
            package: payment.package,
            signType: payment.signType,
            paySign: payment.paySign, // 需要后端生成
            success: (res) => {
              wx.showToast({
                title: '支付成功',
                icon: 'success'
              });
            },
            fail: (error) => {
              wx.showToast({
                title: '支付失败',
                icon: 'error'
              });
            }
          });
        }
      }
    });
  }
});
```

---

## 🔐 安全建议

1. **Token 管理:**
   - 将 token 存储在 `wx.setStorageSync()` 中
   - 每次请求都在 Authorization 头中传递
   - Token 过期后需要重新登录

2. **HTTPS:**
   - 所有 API 请求都使用 HTTPS
   - 微信小程序要求所有网络请求都必须是 HTTPS

3. **错误处理:**
   - 检查响应的 `code` 字段
   - 实现重试机制
   - 记录错误日志

4. **数据验证:**
   - 在客户端验证输入数据
   - 服务器端也要进行验证

---

## 📞 常见问题

**Q: 如何处理 Token 过期?**
A: 当收到 401 错误时,清除本地 token,重新调用登录接口。

**Q: 如何上传图片?**
A: 使用 `wx.uploadFile()` 上传到图片服务器,获得 URL 后传给 API。

**Q: 支付功能如何完整实现?**
A: 需要完整的微信支付 V3 API 签名,建议联系微信支付技术支持。

---

## 📚 更多资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信支付文档](https://pay.weixin.qq.com/wiki)
- [API 基础 URL](https://seal-carving-wechat-agent-cri8.vercel.app)

---

**部署日期:** 2026-01-11  
**API 版本:** 1.0.0  
**状态:** ✅ 正常运行
