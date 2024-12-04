const config = require("../config/thirdPartyApi");
const { getListDir, getFileInfo } = require("../services/alistService");
const { horizontalImageRootPath, verticalImageRootPath } = config.api2;

// 获取文件总数和分页信息
async function getFileCount(imageRootPath, getListDirFn) {
  const param = {
    path: imageRootPath,
    page: 1,
    per_page: 1, // 这里只需要获取一个文件，来判断总数
  };

  try {
    const response = await getListDirFn(param);
    if (response.code !== 200) {
      console.error(`请求失败：${response.message}`);
      return 0; // 失败时返回0
    }

    const { total } = response.data;
    return total;
  } catch (error) {
    console.error(`获取文件数量出错：${error.message}`);
    return 0; // 失败时返回0
  }
}

// 随机获取文件的通用函数
async function getRandomFile(imageRootPath, getListDirFn) {
  const totalCount = await getFileCount(imageRootPath, getListDirFn);
  if (totalCount === 0) {
    console.error("没有可用的文件");
    return null;
  }

  // 计算总页数
  const perPage = 20;
  const totalPages = Math.ceil(totalCount / perPage);

  // 随机选择一个页面
  const randomPage = Math.floor(Math.random() * totalPages) + 1;

  // 获取该页的文件
  const param = {
    path: imageRootPath,
    page: randomPage,
    per_page: perPage,
  };

  try {
    const response = await getListDirFn(param);
    if (response.code !== 200) {
      console.error(`请求失败：${response.message}`);
      return null;
    }

    const { content } = response.data;

    // 随机选择一个文件
    const randomIndex = Math.floor(Math.random() * content.length);
    const randomFile = content[randomIndex];

    if (!randomFile.is_dir) {
      const raw_url = await getRawUrl(imageRootPath + "/" + randomFile.name);
      return raw_url;
    }

    return null;
  } catch (error) {
    console.error(`请求出错：${error.message}`);
    return null;
  }
}

// 获取 raw_url 的通用函数
const getRawUrl = async (path) => {
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

    const { raw_url } = response.data;

    if (raw_url) {
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

// 随机获取文件路径的通用函数
async function getRandomFilePath(imageRootPath) {
  const totalCount = await getFileCount(imageRootPath, getListDir);
  if (totalCount === 0) {
    console.error("没有可用的文件");
    return null;
  }

  // 计算总页数
  const perPage = 20;
  const totalPages = Math.ceil(totalCount / perPage);

  // 随机选择一个页面
  const randomPage = Math.floor(Math.random() * totalPages) + 1;

  // 获取该页的文件
  const param = {
    path: imageRootPath,
    page: randomPage,
    per_page: perPage,
  };

  try {
    const response = await getListDir(param);
    if (response.code !== 200) {
      console.error(`请求失败：${response.message}`);
      return null;
    }

    const { content } = response.data;

    // 随机选择一个文件
    const randomIndex = Math.floor(Math.random() * content.length);
    const randomFile = content[randomIndex];

    if (!randomFile.is_dir) {
      return imageRootPath + "/" + randomFile.name;
    }

    return null;
  } catch (error) {
    console.error(`请求出错：${error.message}`);
    return null;
  }
}


// 获取随机横屏 URL
async function randomHorizontalUrl() {
  const rawUrl = await getRandomFile(horizontalImageRootPath, getListDir);
  if (rawUrl) {
    console.log(`获取到横屏图片：${rawUrl}`);
    return String(rawUrl);
  } else {
    console.error("未能获取横屏图片");
  }
  return null;
}

// 获取随机竖屏 URL
async function randomVerticalUrl() {
  const rawUrl = await getRandomFile(verticalImageRootPath, getListDir);
  if (rawUrl) {
    console.log(`获取到竖屏图片：${rawUrl}`);
    return String(rawUrl);
  } else {
    console.error("未能获取竖屏图片");
  }
  return null;
}

module.exports = {
  randomHorizontalUrl,
  randomVerticalUrl,
  getRandomFilePath,
  getRawUrl,
};
