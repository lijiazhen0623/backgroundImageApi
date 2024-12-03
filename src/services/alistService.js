// 服务层，负责与第三方 API 交互

const httpClient = require("../utils/httpClient");
const config = require("../config/thirdPartyApi");

const { baseUrl, alistToken, horizontalImageRootPath, verticalImageRootPath } =
  config.api2;

// POST 列出文件目录
    // "path": "",
    // "password": "",
    // "page": 1,
    // "per_page": 0,
    // "refresh": false
  async function getListDir(data) {
    const headers = {
      Authorization: alistToken,
    };

    const param = {
      path: data.path,
      password: data.password || "",
      page: data.page || 1,
      per_page: data.per_page || 20,
      refresh: data.refresh || false,
    };

    return await httpClient.post(`${baseUrl}/api/fs/list`, param, {
      headers,
    });
  };

  // 获取某个文件/目录信息
    //   "path": "",
    // "password": "",
    // "page": 1,
    // "per_page": 0,
    // "refresh": false
async function getFileInfo(data) {
  const headers = {
    Authorization: alistToken,
  };
  const param = {
    path: data.path,
    password: data.password || "",
    page: data.page || 1,
    per_page: data.per_page || 20,
    refresh: data.refresh || false,
  };
  return await httpClient.post(`${baseUrl}/api/fs/get`, param, {
    headers,
  });
}

module.exports = {
  getListDir,
  getFileInfo,
};
