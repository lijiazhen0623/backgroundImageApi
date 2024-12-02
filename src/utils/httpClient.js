const axios = require("axios");

// 创建一个 axios 实例，设置默认的请求配置
const httpClient = axios.create({
  timeout: 10000, // 设置请求超时时间为 10 秒
  headers: {
    "Content-Type": "application/json", // 默认发送 JSON 数据
  },
});

// 请求拦截器：打印请求日志
httpClient.interceptors.request.use(
  (config) => {
    console.log("Request Info:", {
      method: config.method.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    // 请求失败，打印错误日志
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器：处理请求成功或失败的结果
httpClient.interceptors.response.use(
  (response) => response.data, // 请求成功，直接返回数据
  (error) => {
    // 请求失败，返回错误信息
    console.error(
      "Response Error:",
      error.response ? error.response.data : error
    );
    return Promise.reject(error.response ? error.response.data : error);
  }
);

module.exports = httpClient;
