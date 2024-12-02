const horizontalURLs = new Set([]);
const horizontalLastFileId = new Set([]);

const verticalURLs = new Set([]);
const verticalLastFileId = new Set([]);

//横屏
// 合并新的 horizontalUserSelfURL 数据
function mergeHorizontalUserSelfURLs(response) {
  const fileList = response.data?.fileList || [];
  const lastFileId = response.data?.lastFileId || "";

  fileList.forEach((file) => {
    if (file.userSelfURL) {
      horizontalURLs.add(file.userSelfURL); // 将新 URL 添加到全局集合
    }
  });

  if (lastFileId) {
    horizontalLastFileId.add(lastFileId);
  }
}

// 随机获取horizontal的url
function randomHorizontalUrl() {
  // 转换 Set 为数组
  const urlArray = Array.from(horizontalURLs);
  // 随机获取一个 URL
  const randomIndex = Math.floor(Math.random() * urlArray.length);
  return urlArray[randomIndex]; // 返回随机选取的 URL
}

// 随机获取horizontal的LastFileId
function randomHorizontalLastFileId() {
  // 转换 Set 为数组
  const fileIdArray = Array.from(horizontalLastFileId);
  // 随机获取一个 URL
  const randomIndex = Math.floor(Math.random() * fileIdArray.length);
  return fileIdArray[randomIndex]; // 返回随机选取的 URL
}


//竖屏
// 合并新的 verticalUserSelfURL 数据
function mergeVerticalUserSelfURLs(response) {
  const fileList = response.data?.fileList || [];
  const lastFileId = response.data?.lastFileId || "";

  fileList.forEach((file) => {
    if (file.userSelfURL) {
      verticalURLs.add(file.userSelfURL); // 将新 URL 添加到全局集合
    }
  });

  if (lastFileId) {
    verticalLastFileId.add(lastFileId);
  }
}

// 随机获取Vertical的url
function randomVerticalUrl() {
  // 转换 Set 为数组
  const urlArray = Array.from(verticalURLs);
  // 随机获取一个 URL
  const randomIndex = Math.floor(Math.random() * urlArray.length);
  return urlArray[randomIndex]; // 返回随机选取的 URL
}

// 随机获取Vertical的LastFileId
function randomVerticalLastFileId() {
  // 转换 Set 为数组
  const fileIdArray = Array.from(verticalLastFileId);
  // 随机获取一个 URL
  const randomIndex = Math.floor(Math.random() * fileIdArray.length);
  return fileIdArray[randomIndex]; // 返回随机选取的 URL
}

module.exports = {
  mergeHorizontalUserSelfURLs,
  randomHorizontalUrl,
  randomHorizontalLastFileId,
  mergeVerticalUserSelfURLs,
  randomVerticalUrl,
  randomVerticalLastFileId,
};
