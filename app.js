// 应用入口文件，初始化 Express 应用并挂载路由
// 引入 dotenv 库，加载 .env 文件
require("dotenv").config({ path: "./.env" });
const express = require("express");
const routes = require("./src/routes");
const morgan = require('morgan'); // 导入 morgan 中间件
const path = require("path");
const { initConfig } = require("./src/utils/init");
const IPBlacklistTool = require('./src/utils/IPBlacklistTool'); // 引入黑名单工具类
const app = express();


// 使用 morgan 中间件记录请求日志
app.use(morgan('combined')); // 'combined' 格式包含详细的日志信息

//==============黑名单===========
 // 每分钟最多请求30次，封禁时间8小时，黑名单最大1000个IP
const ipBlacklistTool = new IPBlacklistTool(30, 8 * 60 * 60 * 1000, 1000);
// 启用 trust proxy 配置
ipBlacklistTool.enableTrustProxy(app);
// 使用中间件处理IP请求
app.use((req, res, next) => ipBlacklistTool.handleRequest(req, res, next));
//=================================

// 捕获所有未处理的错误
app.use((err, req, res, next) => {
  const time = new Date().toISOString();
  console.error(`[${time}] Error occurred: ${err.message}`);
  res.status(500).send('Something went wrong!');
});
// 自定义中间件设置 CORS 头
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*'); // 允许的来源，'*' 表示允许所有
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // 允许的 HTTP 方法
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 允许的自定义头
//   next();
// });



app.use(express.json()); // 解析 JSON 请求体
app.use("/api", routes); // 挂载 API 路由

// 设置静态文件目录
app.use(express.static(path.join(__dirname, "./src/public")));
// 默认路由返回 index.html
app.get("/adaptive", (req, res) => {
  res.sendFile(path.join(__dirname, "./src/public/adaptive", "script.js"));
});
app.get("/horizontal", (req, res) => {
  res.sendFile(path.join(__dirname, "./src/public/horizontal", "index.html"));
});
app.get("/vertical", (req, res) => {
  res.sendFile(path.join(__dirname, "./src/public/vertical", "index.html"));
});

// 设置监听端口
const PORT = process.env.PORT || 3000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  //初始化
  initConfig();
});

module.exports = app;
