// 应用入口文件，初始化 Express 应用并挂载路由

const express = require("express");
const routes = require("./routes");
const morgan = require('morgan'); // 导入 morgan 中间件
const path = require("path");

const app = express();

// 使用 morgan 中间件记录请求日志
app.use(morgan('combined')); // 'combined' 格式包含详细的日志信息

// 捕获所有未处理的错误
app.use((err, req, res, next) => {
  const time = new Date().toISOString();
  console.error(`[${time}] Error occurred: ${err.message}`);
  res.status(500).send('Something went wrong!');
});


app.use(express.json()); // 解析 JSON 请求体
app.use("/api", routes); // 挂载 API 路由

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
// 默认路由返回 index.html
app.get("/adaptive", (req, res) => {
  res.sendFile(path.join(__dirname, "public/adaptive", "index.html"));
});
app.get("/horizontal", (req, res) => {
  res.sendFile(path.join(__dirname, "public/horizontal", "index.html"));
});
app.get("/vertical", (req, res) => {
  res.sendFile(path.join(__dirname, "public/vertical", "index.html"));
});

module.exports = app;
