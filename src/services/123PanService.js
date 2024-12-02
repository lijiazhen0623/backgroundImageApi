// 服务层，负责与第三方 API 交互

const httpClient = require("../utils/httpClient");
const config = require("../config/thirdPartyApi");

const {
  getTokenData,
} = require("../config/123panConfig/tokenManager");

// 获取access_token
async function getAccessToken(params) {
  const { baseUrl, clientSecret, clientID, Platform } = config.api1; // 使用 123pan 的配置信息
  const headers = {
    Platform: Platform,
  };
  const data = {
    clientSecret,
    clientID,
  };
  return await httpClient.post(`${baseUrl}/api/v1/access_token`, data, {
    headers
  });
}

// POST 获取图床文件列表
//   parentFileId,
//   limit,
//   startTime,
//   endTime,
//   lastFileId,
//   type = 1,
  async function getOssFileList(data) {
    const { accessToken, expiredAt } = getTokenData();
    const { baseUrl, clientSecret, clientID, Platform } = config.api1;
    const headers = {
      Platform: Platform,
      Authorization: `Bearer ${accessToken}`,
    };
    return await httpClient.post(`${baseUrl}/api/v1/oss/file/list`, null, {
      headers,
      params: data,
    });
  };

module.exports = {
  getAccessToken,
  getOssFileList,
};
