// 定义 API 路由，处理不同的 HTTP 请求类型

const express = require("express");
const {
  handleGetAccessToken,
  handleForceGetAccessToken,
  getHorizontalImageUrl,
  getVerticalImageUrl,
} = require("../controllers/123PanController");

const router = express.Router();

// 获取token
router.get("/get123PanToken", handleGetAccessToken);

//强制获取token
router.get("/getForce123PanToken", handleForceGetAccessToken);

// 横屏壁纸
router.get("/horizontal", getHorizontalImageUrl);

// 竖屏壁纸
router.get("/vertical", getVerticalImageUrl);

module.exports = router;
