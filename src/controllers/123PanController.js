const { getAccessToken, getOssFileList } = require("../services/123PanService");
const {
  saveTokenData,
  getTokenData,
} = require("../config/123panConfig/tokenManager");

const {
  mergeHorizontalUserSelfURLs,
  randomHorizontalUrl,
  randomHorizontalLastFileId,
  mergeVerticalUserSelfURLs,
  randomVerticalUrl,
  randomVerticalLastFileId,
} = require("../utils/123PanImageUrlsUtils");

// 使用 moment.js 进行时间比较
const moment = require("moment");

// 强制获取token
async function handleForceGetAccessToken(req, res) {
  try {
    const response = await getAccessToken();
    console.log(response);
    const tokenData = response.data;
    const { accessToken, expiredAt } = tokenData; // 提取 accessToken 和 expiredAt
    console.log("Access Token:", accessToken);
    console.log("Expired At:", expiredAt);
    saveTokenData(accessToken, expiredAt);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// 获取token
async function handleGetAccessToken(req, res) {
  const tokenData = getTokenData(); // 尝试从文件读取 token

  if (tokenData) {
    const { expiredAt } = tokenData;
    if (isTokenExpired(expiredAt)) {
      console.log("Token not found, fetching new token...");
      await handleForceGetAccessToken(req, res); // 强制获取并保存新的 token
    } else {
      console.log("Token retrieved from file:", tokenData);
      res.json({ success: true, tokenData });
    }
  } else {
    console.log("Token not found, fetching new token...");
    await handleForceGetAccessToken(req, res); // 强制获取并保存新的 token
  }
}

// 检查 token 是否过期
function isTokenExpired(expiredAt) {
  const currentTime = moment(); // 当前时间
  const expirationTime = moment(expiredAt).subtract(1, "days"); // 提前一天判断，减少 1 天

  return currentTime.isAfter(expirationTime); // 如果当前时间大于过期时间，则返回 true
}

// horizontal 横屏壁纸url获取
async function getHorizontalImageUrl(req, res) {
  try {
    const data = {
      parentFileId: "yk6baz03t0m000d5qauzx31wsch0ewizDIYwAdrPDdD2AcxwDdQ=",
      limit: 50,
      // startTime,
      // endTime,
      lastFileId: randomHorizontalLastFileId(),
      type: 1,
    };
    const response = await getOssFileList(data);
    mergeHorizontalUserSelfURLs(response);
    console.log(response);
    const horizontalUrl = randomHorizontalUrl();
    // 重定向到 horizontalUrl
    res.redirect(horizontalUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// vertical 竖屏壁纸url获取
async function getVerticalImageUrl(req, res) {
  try {
    const data = {
      parentFileId: "yk6baz03t0l000d5qauzeka3751iglc2DIYwAdrPDdD2AcxwDdQ=",
      limit: 50,
      // startTime,
      // endTime,
      lastFileId: randomVerticalLastFileId(),
      type: 1,
    };
    const response = await getOssFileList(data);
    mergeVerticalUserSelfURLs(response);
    console.log(response);
    const verticalUrl = randomVerticalUrl();
    // 重定向到 verticalUrl
    res.redirect(verticalUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  handleGetAccessToken,
  handleForceGetAccessToken,
  getHorizontalImageUrl,
  getVerticalImageUrl,
};
