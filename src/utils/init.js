// 引入 dotenv 库，加载 .env 文件
require("dotenv").config();

const { getAccessToken } = require("../services/123PanService");
const {
  saveTokenData,
  getTokenData,
} = require("../config/123panConfig/tokenManager");
// 使用 moment.js 进行时间比较
const moment = require("moment");

async function initConfig() {
  console.log("初始化配置。。。");
  setTimeout(async () => {
    await init123panConfig(); // 自动获取并处理 token
    console.log("初始化token完成。");
    // 设置定时器，每隔 60 秒执行一次
    setInterval(init123panConfig, 60000);
  }, 1000);
}

async function init123panConfig() {
  console.log("123网盘token更新");
  const tokenData = getTokenData(); // 尝试从文件读取 token

  if (tokenData) {
    const { expiredAt } = tokenData;
    if (isTokenExpired(expiredAt)) {
      console.log("Token not found, fetching new token...");
      await get123PanToken();
    } else {
      console.log("Token retrieved from file:", tokenData);
    }
  } else {
    console.log("Token not found, fetching new token...");
    await get123PanToken();
  }
}

async function get123PanToken() {
  const response = await getAccessToken();
  console.log(response);
  const newTokenData = response.data;
  const { accessToken, expiredAt } = newTokenData; // 提取 accessToken 和 expiredAt
  console.log("Access Token:", accessToken);
  console.log("Expired At:", expiredAt);
  saveTokenData(accessToken, expiredAt);
}

// 检查 token 是否过期
function isTokenExpired(expiredAt) {
  const currentTime = moment(); // 当前时间
  const expirationTime = moment(expiredAt).subtract(1, "days"); // 提前一天判断，减少 1 天

  return currentTime.isAfter(expirationTime); // 如果当前时间大于过期时间，则返回 true
}

module.exports = { initConfig };
