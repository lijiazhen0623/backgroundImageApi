// 汇总所有路由并导出
const express = require("express");
const oneTwoThreePanApiRoutes = require("./123PanApiRoutes");

const router = express.Router();

router.use(oneTwoThreePanApiRoutes);

module.exports = router;
