const config = require("../config/thirdPartyApi");
const { getListDir, getFileInfo } = require("../services/alistService");
const { baseUrl, alistToken, horizontalImageRootPath, verticalImageRootPath } =
  config.api2;

const horizontalURLs = new Map();
let horizontalImageCount = 0;

const verticalURLs = new Map();
let verticalImageCount = 0;

// 合并 URL 的通用函数
async function mergeRawUrls(imageRootPath, urlMap, imageCount, getListDirFn) {
  let nowPage = 1;
  const nowPerPage = 20;
  let itemCount = 0;
  let allPage = 1;

  do {
    const param = {
      path: imageRootPath,
      page: nowPage,
      per_page: nowPerPage,
    };

    try {
      const response = await getListDirFn(param);
      console.log(param);
      if (response.code !== 200) {
        console.error(`请求失败：${response.message}`);
        break;
      }

      const { content, total: responseTotal } = response.data;
      itemCount = responseTotal;
      allPage = Math.ceil(itemCount / nowPerPage);

      // 处理每一项内容
      for (const item of content) {
        if (!item.is_dir) {
          try {
            const raw_url = await getRawUrlMap(
              imageRootPath + "/" + item.name,
              urlMap
            );
            if (raw_url) {
              imageCount++;
            }
          } catch (error) {
            console.error(`处理文件 ${item.name} 时出错: ${error.message}`);
            // 不中断循环，继续处理下一个文件
          }
        }
      }

      console.log(`第 ${nowPage} 页处理完成，当前加载图片数量: ${imageCount}`);
      nowPage++;
    } catch (error) {
      console.error(`请求出错：${error.message}`);
      break;
    }
  } while (nowPage <= allPage);
}

// 获取 raw_url 的通用函数
const getRawUrlMap = async (path, urlMap) => {
  console.log(`Processing file: ${path}`);
  try {
    const param = {
      path: path,
      page: 1,
      per_page: 1,
    };

    const response = await getFileInfo(param);

    if (response.code !== 200) {
      console.error(`请求失败：${response.message}`);
      return null;
    }

    const { sign, raw_url } = response.data;

    if (raw_url) {
      urlMap.set(sign, raw_url);
      console.log(`Added to map: ${sign} -> ${raw_url}`);
      return raw_url;
    } else {
      console.error("未找到 raw_url 字段");
      return null;
    }
  } catch (error) {
    console.error(`请求出错：${error.message}`);
    return null;
  }
};

// 获取随机 URL 的通用函数
async function randomUrl(urlMap) {
  if (urlMap.size === 0) {
    console.log("URL set is empty, merging raw URLs...");
    await mergeRawUrls(); // 等待合并完成
  }

  const urlArray = Array.from(urlMap.values());

  if (urlArray.length === 0) {
    throw new Error("No URLs available after merging.");
  }

  const randomIndex = Math.floor(Math.random() * urlArray.length);
  return urlArray[randomIndex];
}

// 横屏
async function mergeHorizontalRawUrls() {
  await mergeRawUrls(
    horizontalImageRootPath,
    horizontalURLs,
    horizontalImageCount,
    getListDir
  );
}

async function randomHorizontalUrl() {
  return randomUrl(horizontalURLs);
}

// 竖屏
async function mergeVerticalRawUrls() {
  await mergeRawUrls(
    verticalImageRootPath,
    verticalURLs,
    verticalImageCount,
    getListDir
  );
}

async function randomVerticalUrl() {
  return randomUrl(verticalURLs);
}

// 设置任务每30分钟执行一次
function startScheduledTask() {
  console.log("启动alist定时任务，每30分钟执行一次合并操作...");

  // 第一次立即执行合并操作
  mergeHorizontalRawUrls();
  mergeVerticalRawUrls();

  // 每30分钟执行一次
  setInterval(async () => {
    console.log("开始执行定时任务...");
    await mergeHorizontalRawUrls();
    await mergeVerticalRawUrls();
  }, 30 * 60 * 1000); // 30分钟 = 30 * 60 * 1000 毫秒
}

// 启动任务
// startScheduledTask();


module.exports = {
  mergeHorizontalRawUrls,
  randomHorizontalUrl,
  mergeVerticalRawUrls,
  randomVerticalUrl,
};
