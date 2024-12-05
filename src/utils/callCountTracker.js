const fs = require("fs");
const path = require("path");

class CallCountTracker {
  constructor(
    filePath = "./api_call_counts.json",
    allowedPaths = [],
    interval = 2000
  ) {
    if (CallCountTracker.instance) {
      return CallCountTracker.instance;
    }

    this.filePath = path.resolve(filePath); // 默认文件路径
    this.allowedPaths = new Set(allowedPaths); // 使用 Set 提高路径查询效率
    this.interval = interval; // 自动保存间隔
    this.callCounts = { totalCalls: 0 }; // 初始化数据结构，包含总调用数
    this._ensureFileExists();
    this._loadCallCounts();
    this._startAutoSave();

    CallCountTracker.instance = this; // 设置实例为单例
  }

  // 确保文件存在
  _ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify({ totalCalls: 0 }, null, 2)
      );
      console.log(`Created new JSON file at ${this.filePath}`);
    }
  }

  // 加载记录文件
  _loadCallCounts() {
    try {
      const data = fs.readFileSync(this.filePath, "utf-8");
      this.callCounts = JSON.parse(data);
      console.log("Call counts loaded successfully from", this.filePath);
    } catch (error) {
      console.error("Failed to read or parse the JSON file:", error);
      this.callCounts = { totalCalls: 0 }; // 初始化为基础结构
    }
  }

  // 保存记录文件
  _saveCallCounts() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.callCounts, null, 2));
      // console.log("Call counts saved successfully to", this.filePath);
    } catch (error) {
      console.error("Failed to save the JSON file:", error);
    }
  }

  // 开启自动保存
  _startAutoSave() {
    setInterval(() => this._saveCallCounts(), this.interval);
  }

  // 记录接口调用
  recordCall(path) {
    if (this.allowedPaths.size > 0 && !this.allowedPaths.has(path)) {
      // 如果指定了允许路径，但当前路径不在其中，则忽略
      return;
    }
    if (!this.callCounts[path]) {
      this.callCounts[path] = 0;
    }
    this.callCounts[path]++;
    this.callCounts.totalCalls++; // 增加总调用数
  }

  // 获取调用次数
  getCallCounts() {
    return this.callCounts;
  }

  // 静态方法获取单例实例
  static getInstance(filePath = "./api_call_counts.json") {
    if (!CallCountTracker.instance) {
      const allowedPaths = process.env.ALLOWED_PATHS
        ? process.env.ALLOWED_PATHS.split(",") // 从 .env 配置文件读取路径
        : [];
      new CallCountTracker(filePath, allowedPaths);
    }
    return CallCountTracker.instance;
  }
}

module.exports = CallCountTracker;
