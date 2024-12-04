const Deque = require("collections/deque"); // 引入双端队列库

class IPBlacklistTool {
  constructor(
    requestLimitPerMinute = 30, // 每分钟请求次数上限
    requestLimitPerHour = 100, // 每小时请求次数上限
    blockTime = 8, // 封禁时间（小时）
    maxBlacklistSize = 1000 // 黑名单最大大小
  ) {
    // 黑名单存储，使用 Set 保证唯一性
    this.blacklist = new Set();
    // IP 请求记录存储，使用 Map 提高查找效率，每个 IP 用 deque 存储请求时间
    this.ipRequests = new Map();
    // 请求限制：每分钟最多请求次数
    this.requestLimitPerMinute = requestLimitPerMinute;
    // 每小时请求次数上限
    this.requestLimitPerHour = requestLimitPerHour;
    // 阻止时间：封禁持续时间，修改为 8 小时
    this.blockTime = blockTime * 60 * 60 * 1000;
    // 黑名单最大大小
    this.maxBlacklistSize = maxBlacklistSize;

    // 存储定时器引用，防止重复设置
    this.ipTimers = new Map();

    // 每5秒打印一次黑名单
    setInterval(() => {
      console.log("当前黑名单:", [...this.blacklist]);
      this.monitorMemoryUsage(); // 监控内存使用情况
    }, 5000);

    // 打印黑名单系统启动日志
    console.log("IP 黑名单系统已启动。");

    console.log(
      "每分钟请求次数限制：" +
        requestLimitPerMinute +
        "  每小时请求次数限制：" +
        requestLimitPerHour +
        "  封禁时间（小时）：" +
        blockTime
    );
  }

  // 启用 Express 的 trust proxy 配置
  enableTrustProxy(app) {
    app.set("trust proxy", true); // 设置信任代理
  }

  // 获取真实的客户端 IP 地址
  getRealIP(req) {
    return req.ip; // 获取客户端真实 IP 地址
  }

  // 检查IP是否在黑名单中
  isBlocked(ip) {
    return this.blacklist.has(ip);
  }

  // 记录请求并判断是否需要加入黑名单
  recordRequest(ip) {
    const currentTime = Date.now();

    // 如果该IP没有记录，初始化请求记录
    if (!this.ipRequests.has(ip)) {
      this.ipRequests.set(ip, new Deque());
    }

    const requests = this.ipRequests.get(ip); // 获取请求记录

    // 只保留过去1分钟内的请求记录
    while (requests.length > 0 && currentTime - requests.peek() > 60 * 1000) {
      requests.shift(); // 移除超过1分钟的请求
    }

    // 记录当前请求时间
    requests.push(currentTime);

    // 每小时请求次数检查
    const hourlyRequests = requests.filter(
      (requestTime) => currentTime - requestTime <= 60 * 60 * 1000
    );

    // 如果1小时内请求次数超过限制，封禁该IP
    if (hourlyRequests.length > this.requestLimitPerHour) {
      if (!this.blacklist.has(ip)) {
        console.log(`IP ${ip} 超过1小时请求限制，添加到黑名单。`);
      }

      // 如果黑名单已满，删除最旧的IP
      if (this.blacklist.size >= this.maxBlacklistSize) {
        const oldestIp = this.blacklist.values().next().value;
        this.blacklist.delete(oldestIp);
        console.log(`黑名单容量已满，移除最旧的IP：${oldestIp}`);
      }

      this.blacklist.add(ip);

      // 如果该IP已经有定时器，清除之前的定时器
      if (this.ipTimers.has(ip)) {
        clearTimeout(this.ipTimers.get(ip));
      }

      // 设置定时器，封禁时间结束后移除该IP
      const timer = setTimeout(() => {
        this.blacklist.delete(ip);
        console.log(`IP ${ip} 已从黑名单中移除。`);
      }, this.blockTime);

      // 保存定时器引用
      this.ipTimers.set(ip, timer);
    }

    // 如果请求次数超过每分钟限制，将该IP加入黑名单
    if (requests.length > this.requestLimitPerMinute) {
      if (!this.blacklist.has(ip)) {
        console.log(`IP ${ip} 超过每分钟请求限制，添加到黑名单。`);
      }

      // 如果黑名单已满，删除最旧的IP
      if (this.blacklist.size >= this.maxBlacklistSize) {
        const oldestIp = this.blacklist.values().next().value;
        this.blacklist.delete(oldestIp);
        console.log(`黑名单容量已满，移除最旧的IP：${oldestIp}`);
      }

      this.blacklist.add(ip);

      // 如果该IP已经有定时器，清除之前的定时器
      if (this.ipTimers.has(ip)) {
        clearTimeout(this.ipTimers.get(ip));
      }

      // 设置定时器，封禁时间结束后移除该IP
      const timer = setTimeout(() => {
        this.blacklist.delete(ip);
        console.log(`IP ${ip} 已从黑名单中移除。`);
      }, this.blockTime);

      // 保存定时器引用
      this.ipTimers.set(ip, timer);
    }
  }

  // 中间件：检测IP是否被封禁
  handleRequest(req, res, next) {
    const ip = this.getRealIP(req); // 获取真实客户端 IP 地址

    if (this.isBlocked(ip)) {
      return res
        .status(403)
        .send("您的 IP 因请求次数过多被封禁，请 8 小时后再试。");
    }

    // 记录请求
    this.recordRequest(ip);

    next();
  }

  // 监控内存使用情况
  monitorMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    console.log("内存使用情况:", {
      rss: memoryUsage.rss / 1024 / 1024, // 常驻内存
      heapTotal: memoryUsage.heapTotal / 1024 / 1024, // 堆内存总量
      heapUsed: memoryUsage.heapUsed / 1024 / 1024, // 已使用堆内存
      external: memoryUsage.external / 1024 / 1024, // 外部内存
    });
  }
}

module.exports = IPBlacklistTool;
