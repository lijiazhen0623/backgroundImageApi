const {
  randomHorizontalUrl,
  randomVerticalUrl,
} = require("../utils/alistImageUrlsUtils");

// horizontal 横屏壁纸url获取
async function getHorizontalImageUrlAlist(req, res) {
  console.log(2)
  try {
    const horizontalUrl = await randomHorizontalUrl();
    // 重定向到 horizontalUrl
    res.redirect(horizontalUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getHorizontalImageUrlJsonAlist(req, res) {
  try {
    const horizontalUrl = await randomHorizontalUrl();
    console.log(horizontalUrl+"+++++++++++++++++++++++++++++++++");
    // 返回 JSON 数据
    res.json({ success: true, url: horizontalUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// vertical 竖屏壁纸url获取
async function getVerticalImageUrlAlist(req, res) {
  try {
    const verticalUrl = await randomVerticalUrl();
    // 重定向到 verticalUrl
    res.redirect(verticalUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getVerticalImageUrlJsonAlist(req, res) {
  try {
    const verticalUrl = await randomVerticalUrl();
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
