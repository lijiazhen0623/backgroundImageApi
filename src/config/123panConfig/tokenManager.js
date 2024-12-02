// tokenManager.js
const fs = require("fs");
const path = require("path");

// 存储 token 数据的文件路径
const tokenFilePath = path.join(__dirname, "./123panTokenData.json");

// 保存 token 数据
function saveTokenData(accessToken, expiredAt) {
  const tokenData = { accessToken, expiredAt };

  // 将数据写入文件
  fs.writeFileSync(tokenFilePath, JSON.stringify(tokenData, null, 2));
  console.log("Token data saved successfully.");
}

// 读取 token 数据
function getTokenData() {
  if (fs.existsSync(tokenFilePath)) {
    try {
      const tokenData = fs.readFileSync(tokenFilePath, "utf8");

      // 确保读取的文件内容不是空的
      if (tokenData.trim() === "") {
        console.error("Token file is empty.");
        return null;
      }

      return JSON.parse(tokenData); // 尝试解析 JSON
    } catch (error) {
      console.error("Error parsing token data:", error.message);
      return null; // 解析失败，返回 null
    }
  }

  console.error("Token file does not exist.");
  return null; // 如果文件不存在，返回 null
}

module.exports = { saveTokenData, getTokenData };
