// 汇总所有路由并导出
const express = require("express");
const oneTwoThreePanApiRoutes = require("./apiRoutes");

const router = express.Router();

router.use(oneTwoThreePanApiRoutes);

module.exports = router;
