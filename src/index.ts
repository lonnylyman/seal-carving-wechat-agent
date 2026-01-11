import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
}));

// 常量
const WECHAT_APPID = process.env.WECHAT_APPID!;
const WECHAT_APPSECRET = process.env.WECHAT_APPSECRET!;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 模拟数据存储(生产环境应使用数据库)
const users = new Map();
const designs = new Map();
const favorites = new Map();
let idCounter = 1;

// ==================== 认证中间件 ====================
const authMiddleware = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '缺少认证令牌' });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.openid = decoded.openid;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, message: '认证失败' });
  }
};

// ==================== 健康检查 ====================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({
    name: '篆刻设计小助手 - 微信小程序Agent API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      designs: '/api/designs',
      payment: '/api/payment',
    },
  });
});

// ==================== 认证API ====================

// 微信登录
app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ code: 400, message: '缺少授权码' });
    }

    // 调用微信API
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: WECHAT_APPID,
        secret: WECHAT_APPSECRET,
        js_code: code,
        grant_type: 'authorization_code',
      },
    });

    const { openid, session_key, errcode, errmsg } = response.data;
    if (errcode) {
      return res.status(400).json({ code: 400, message: `微信认证失败: ${errmsg}` });
    }

    // 查找或创建用户
    let user = Array.from(users.values()).find((u: any) => u.openid === openid);
    if (!user) {
      user = {
        id: idCounter++,
        openid,
        nickname: `用户${idCounter}`,
        avatar: '',
        createdAt: new Date(),
      };
      users.set(user.id, user);
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, openid: user.openid },
      JWT_SECRET as any,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname,
          avatar: user.avatar,
        },
        sessionKey: session_key,
      },
    });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '登录失败', error: error.message });
  }
});

// 获取用户信息
app.get('/api/auth/user', authMiddleware, (req: any, res: any) => {
  try {
    const user = users.get(req.userId);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({
      code: 0,
      message: '获取成功',
      data: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '获取用户信息失败', error: error.message });
  }
});

// 更新用户信息
app.put('/api/auth/user', authMiddleware, (req: any, res: any) => {
  try {
    const user = users.get(req.userId);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    const { nickname, avatar } = req.body;
    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;
    res.json({ code: 0, message: '更新成功', data: user });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '更新失败', error: error.message });
  }
});

// ==================== 设计API ====================

// 创建设计
app.post('/api/designs', authMiddleware, (req: any, res: any) => {
  try {
    const { title, description, imageUrl, style, characters } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    const design = {
      id: idCounter++,
      userId: req.userId,
      title,
      description,
      imageUrl,
      style,
      characters,
      isPublic: false,
      viewCount: 0,
      createdAt: new Date(),
    };
    designs.set(design.id, design);
    res.json({ code: 0, message: '创建成功', data: design });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '创建失败', error: error.message });
  }
});

// 获取用户设计列表
app.get('/api/designs', authMiddleware, (req: any, res: any) => {
  try {
    const userDesigns = Array.from(designs.values()).filter((d: any) => d.userId === req.userId);
    res.json({ code: 0, message: '获取成功', data: userDesigns });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '获取失败', error: error.message });
  }
});

// 获取设计详情
app.get('/api/designs/:id', (req: any, res: any) => {
  try {
    const design = designs.get(parseInt(req.params.id));
    if (!design) {
      return res.status(404).json({ code: 404, message: '设计不存在' });
    }
    design.viewCount++;
    res.json({ code: 0, message: '获取成功', data: design });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '获取失败', error: error.message });
  }
});

// 删除设计
app.delete('/api/designs/:id', authMiddleware, (req: any, res: any) => {
  try {
    const design = designs.get(parseInt(req.params.id));
    if (!design || design.userId !== req.userId) {
      return res.status(403).json({ code: 403, message: '无权限删除' });
    }
    designs.delete(parseInt(req.params.id));
    res.json({ code: 0, message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '删除失败', error: error.message });
  }
});

// 收藏设计
app.post('/api/designs/:id/favorite', authMiddleware, (req: any, res: any) => {
  try {
    const designId = parseInt(req.params.id);
    const key = `${req.userId}-${designId}`;
    if (favorites.has(key)) {
      return res.status(400).json({ code: 400, message: '已经收藏过' });
    }
    favorites.set(key, true);
    res.json({ code: 0, message: '收藏成功' });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '收藏失败', error: error.message });
  }
});

// 取消收藏
app.delete('/api/designs/:id/favorite', authMiddleware, (req: any, res: any) => {
  try {
    const designId = parseInt(req.params.id);
    const key = `${req.userId}-${designId}`;
    favorites.delete(key);
    res.json({ code: 0, message: '取消收藏成功' });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '取消收藏失败', error: error.message });
  }
});

// 获取公开设计
app.get('/api/designs/public', (req: any, res: any) => {
  try {
    const publicDesigns = Array.from(designs.values()).filter((d: any) => d.isPublic);
    res.json({ code: 0, message: '获取成功', data: publicDesigns });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '获取失败', error: error.message });
  }
});

// ==================== 支付API ====================

// 创建订单
app.post('/api/payment/orders', authMiddleware, (req: any, res: any) => {
  try {
    const { amount, description } = req.body;
    if (!amount || !description) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }
    const order = {
      id: idCounter++,
      userId: req.userId,
      amount,
      description,
      status: 'pending',
      createdAt: new Date(),
    };
    res.json({
      code: 0,
      message: '订单创建成功',
      data: {
        order,
        payment: {
          prepayId: `wx${Date.now()}`,
          timeStamp: Math.floor(Date.now() / 1000).toString(),
          nonceStr: Math.random().toString(36).substring(2, 15),
          package: `prepay_id=wx${Date.now()}`,
          signType: 'RSA',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: '创建订单失败', error: error.message });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '未找到请求的资源' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  篆刻设计小助手 - 微信小程序Agent API    ║
║  Server running at http://localhost:${PORT}   ║
║  Environment: ${process.env.NODE_ENV || 'development'}                    ║
╚════════════════════════════════════════════╝
  `);
});

export default app;
