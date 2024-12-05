const {
  handleGetAccessToken123Pan,
  handleForceGetAccessToken123Pan,
  getHorizontalImageUrlJson123Pan,
  getHorizontalImageUrl123Pan,
  getVerticalImageUrlJson123Pan,
  getVerticalImageUrl123Pan,
} = require("../controllers/123PanController");

const {
  getHorizontalImageUrlAlist,
  getHorizontalImageUrlJsonAlist,
  getVerticalImageUrlAlist,
  getVerticalImageUrlJsonAlist,
} = require("../controllers/alistController");

const {
  getCallStats,
  getAllCallStats,
} = require("../controllers/callController");

//  1为123盘 2为alist
const mode = process.env.MODE || 2;

// 强制获取token
async function handleForceGetAccessToken(req, res) {
  await handleForceGetAccessToken123Pan(req, res);
}

// 获取token
async function handleGetAccessToken(req, res) {
  await handleGetAccessToken123Pan(req, res);
}

// horizontal 横屏壁纸url获取
async function getHorizontalImageUrl(req, res) {
  if (1 == mode) {
    await getHorizontalImageUrl123Pan(req, res);
  } else if (2 == mode) {
    await getHorizontalImageUrlAlist(req, res);
  }
}

async function getHorizontalImageUrlJson(req, res) {
  if (1 == mode) {
    await getHorizontalImageUrlJson123Pan(req, res);
  } else if (2 == mode) {
    await getHorizontalImageUrlJsonAlist(req, res);
  }
}

// vertical 竖屏壁纸url获取
async function getVerticalImageUrl(req, res) {
  if (1 == mode) {
    await getVerticalImageUrl123Pan(req, res);
  } else if (2 == mode) {
    await getVerticalImageUrlAlist(req, res);
  }
}

async function getVerticalImageUrlJson(req, res) {
  if (1 == mode) {
    await getVerticalImageUrlJson123Pan(req, res);
  } else if (2 == mode) {
    await getVerticalImageUrlJsonAlist(req, res);
  }
}

async function getApiCallStats(req, res) {
  await getCallStats(req, res);
}

async function getApiAllCallStats(req, res) {
  await getAllCallStats(req, res);
}

module.exports = {
  handleForceGetAccessToken,
  handleGetAccessToken,
  getHorizontalImageUrl,
  getHorizontalImageUrlJson,
  getVerticalImageUrl,
  getVerticalImageUrlJson,
  getApiCallStats,
  getApiAllCallStats,
};
