class IPBlacklistTool {
  constructor(
    requestLimitPerMinute = 30,
    blockTime = 8 * 60 * 60 * 1000,
    maxBlacklistSize = 1000
  ) {
    // 黑名单存储，使用 Set 保证唯一性
    this.blacklist = new Set();
    // IP 请求记录存储，使用 Map 提高查找效率
    this.ipRequests = new Map();
    // 请求限制：每分钟最多请求次数
    this.requestLimitPerMinute = requestLimitPerMinute;
    // 阻止时间：封禁持续时间，修改为8小时
    this.blockTime = blockTime;
    // 黑名单最大大小
    this.maxBlacklistSize = maxBlacklistSize;

    // 每5秒打印一次黑名单
    setInterval(() => {
      console.log("Current blacklist:", [...this.blacklist]);
      this.monitorMemoryUsage(); // 监控内存使用情况
    }, 5000);

    // 打印黑名单系统启动日志
    console.log("IP Blacklist system started.");
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
      this.ipRequests.set(ip, []);
    }

    const requests = this.ipRequests.get(ip);

    // 只保留过去1分钟内的请求记录
    while (requests.length > 0 && currentTime - requests[0] > 60 * 1000) {
      requests.shift(); // 移除超过1分钟的请求
    }

    // 记录当前请求时间
    requests.push(currentTime);

    // 如果请求次数超过限制，将该IP加入黑名单
    if (requests.length > this.requestLimitPerMinute) {
      if (!this.blacklist.has(ip)) {
        console.log(
          `IP ${ip} exceeded the request limit. Adding to blacklist.`
        );
      }

      // 如果黑名单已满，删除最旧的IP
      if (this.blacklist.size >= this.maxBlacklistSize) {
        const oldestIp = this.blacklist.values().next().value;
        this.blacklist.delete(oldestIp);
        console.log(
          `Blacklisting capacity reached. Removed oldest IP: ${oldestIp}`
        );
      }

      this.blacklist.add(ip);

      // 设置定时器，封禁时间结束后移除该IP
      setTimeout(() => {
        this.blacklist.delete(ip);
        console.log(`IP ${ip} removed from blacklist.`);
      }, this.blockTime);
    }
  }

  // 中间件：检测IP是否被封禁
  handleRequest(req, res, next) {
    const ip = this.getRealIP(req); // 获取真实客户端 IP 地址

    if (this.isBlocked(ip)) {
      return res
        .status(403)
        .send(
          "Your IP is blocked due to too many requests. Please try again after 8 hours."
        );
    }

    // 记录请求
    this.recordRequest(ip);

    next();
  }

  // 监控内存使用情况
  monitorMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    console.log("Memory usage:", {
      rss: memoryUsage.rss / 1024 / 1024, // Resident Set Size - 常驻内存
      heapTotal: memoryUsage.heapTotal / 1024 / 1024, // 堆内存总量
      heapUsed: memoryUsage.heapUsed / 1024 / 1024, // 已使用堆内存
      external: memoryUsage.external / 1024 / 1024, // 外部内存
    });
  }
}

module.exports = IPBlacklistTool;
