//获取接口调用次数
const CallCountTracker = require("../utils/callCountTracker");
const tracker = CallCountTracker.getInstance(undefined);

async function getCallStats(req, res) {
  const { path } = req.query; // 获取查询参数 `path`

  if (path) {
    // 查询单个接口调用次数
    const count = tracker.getCallCounts()[path];
    if (count !== undefined) {
      res.send(`该接口路径 "${path}" 被调用了 ${count} 次。`);
    } else {
      res.send(`该接口路径 "${path}" 未被调用或未被记录。`);
    }
  } else {
    // 查询总调用次数
    const { totalCalls } = tracker.getCallCounts();
    res.send(`所有接口总调用次数为：${totalCalls} 次。`);
  }
}

async function getAllCallStats(req, res) {
  const callStats = tracker.getCallCounts();
  const statsText = Object.entries(callStats)
    .map(([key, value]) => {
      if (key === "totalCalls") {
        return `截至目前所有接口总调用次数为：${value} 次。`;
      }
    //   return `路径 "${key}" 被调用了 ${value} 次。`;
    })
    .join("\n");

  res.send(statsText);
}

module.exports = {
  getCallStats,
  getAllCallStats,
};