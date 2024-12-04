const {
  randomHorizontalUrl,
  randomVerticalUrl,
} = require("../utils/alistImageUrlsUtils");
const R2Util = require("../utils/r2Util");
const r2Util = new R2Util(
  process.env.R2_ACCESS_KEY_ID,
  process.env.R2_SECRET_ACCESS_KEY,
  process.env.R2_ENDPOINT
);

// horizontal 横屏壁纸url获取
async function getHorizontalImageUrlAlist(req, res) {
  try {
    const horizontalUrl =
      (await r2Util.getRandomImagePath(
        process.env.R2_BUCKET_NAME,
        "二次元图/horizontal/"
      )) || (await randomHorizontalUrl());

    // 重定向到 horizontalUrl
    res.redirect(horizontalUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getHorizontalImageUrlJsonAlist(req, res) {
  try {
    const horizontalUrl =
      (await r2Util.getRandomImagePath(
        process.env.R2_BUCKET_NAME,
        "二次元图/horizontal/"
      )) || (await randomHorizontalUrl());
    // 返回 JSON 数据
    res.json({ success: true, url: horizontalUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// vertical 竖屏壁纸url获取
async function getVerticalImageUrlAlist(req, res) {
  try {
    const verticalUrl =
      (await r2Util.getRandomImagePath(
        process.env.R2_BUCKET_NAME,
        "二次元图/vertical/"
      )) || (await randomVerticalUrl());
    // 重定向到 verticalUrl
    res.redirect(verticalUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getVerticalImageUrlJsonAlist(req, res) {
  try {
    const verticalUrl =
      (await r2Util.getRandomImagePath(
        process.env.R2_BUCKET_NAME,
        "二次元图/vertical/"
      )) || (await randomVerticalUrl());
    // 返回 JSON 数据
    res.json({ success: true, url: verticalUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getHorizontalImageUrlAlist,
  getHorizontalImageUrlJsonAlist,
  getVerticalImageUrlAlist,
  getVerticalImageUrlJsonAlist,
};
