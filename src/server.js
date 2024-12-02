const { initConfig } = require("./utils/init");
// 导入 Express 应用实例
const app = require("./app");

// 设置监听端口
const PORT = process.env.PORT || 3000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  //初始化
  initConfig();
});
