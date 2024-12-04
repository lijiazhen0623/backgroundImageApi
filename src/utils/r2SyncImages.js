const cron = require("node-cron");
const {
  getRandomFilePath,
  getRawUrl,
} = require("../utils/alistImageUrlsUtils");
const config = require("../config/thirdPartyApi");
const { horizontalImageRootPath, verticalImageRootPath } = config.api2;
// 设置定时任务
class SyncImages {
  constructor(r2Util, bucketName, imageUrls) {
    this.r2Util = r2Util;
    this.bucketName = bucketName;
    this.horizontalImages = new Set();
    this.verticalImages = new Set();
  }

  // 定时同步图片的方法
  async startSync() {
    console.log("检测桶内是否需要同步图片");
    if (
      !(await this.r2Util.hasImageFiles(this.bucketName, "")) ||
      !(await this.r2Util.isBucketSizeOverLimit(this.bucketName))
    ) {
      console.log("开始同步。。。。");
      await this.syncImages();
    } else {
      console.log("存在图片文件不需要初始化桶");
    }
    // 设置每天定时执行（例：每天的 01:00 执行）
    cron.schedule(
      "0 1 * * *",
      async () => {
        try {
          console.log("开始执行图片同步任务...");
          await this.syncImages();
        } catch (error) {
          console.error("图片同步任务执行失败：", error);
        }
      },
      {
        timezone: "Asia/Shanghai", // 设置为中国时区（CST）
      }
    );
  }

  // 获取图片 URL，直到每种图片类型分别获取 200 个唯一的图片
  async collectImages() {
    // 获取水平图片，直到数量达到 200 个唯一图片
    while (this.horizontalImages.size < process.env.R2_SYNC_COUNT) {
      console.log("获取horizontal图片...");
      const horizontalPath = await getRandomFilePath(horizontalImageRootPath);
      this.horizontalImages.add(horizontalPath);
    }
    console.log(`horizontal图片路径获取完成: ${this.horizontalImages.size}`);

    // 获取垂直图片，直到数量达到 200 个唯一图片
    while (this.verticalImages.size < process.env.R2_SYNC_COUNT) {
      console.log("获取vertical图片...");
      const verticalPath = await getRandomFilePath(verticalImageRootPath);
      this.verticalImages.add(verticalPath);
    }
    console.log(`vertical图片路径获取完成: ${this.verticalImages.size}`);
  }

  // 同步图片到 R2
  async syncImages() {
    try {
      console.log("开始收集图片...");
      await this.collectImages(); // 收集图片

      // 将 Set 转换为数组
      const horizontalImagesArray = Array.from(this.horizontalImages);
      const verticalImagesArray = Array.from(this.verticalImages);

      console.log("开始上传 horizontal 图片到 R2...");
      await this.uploadInChunks(horizontalImagesArray, "二次元图/horizontal");
      console.log("horizontal 图片同步完成");

      console.log("开始上传 vertical 图片到 R2...");
      await this.uploadInChunks(verticalImagesArray, "二次元图/vertical");
      console.log("vertical 图片同步完成");
      console.log("图片同步完成");
    } catch (error) {
      console.error("图片同步失败:", error);
    }
  }

  // 辅助方法：将数组按块分割上传
  async uploadInChunks(imagesArray, uploadPath, chunkSize = 2) {
    const totalChunks = Math.ceil(imagesArray.length / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = imagesArray.slice(i * chunkSize, (i + 1) * chunkSize);
      console.log(`开始上传第 ${i + 1} 块，共 ${totalChunks} 块...`);

      // 1. 遍历 chunk 中的每个图片路径，调用 getRawUrl 获取实际 URL
      const rawUrls = [];
      for (const path of chunk) {
        try {
          const rawUrl = await getRawUrl(path); // 获取实际的 URL
          rawUrls.push(rawUrl); // 将实际 URL 添加到新数组中
        } catch (error) {
          console.error(`获取 ${path} 的 raw URL 失败:`, error);
        }
      }

      // 2. 上传获取到的 rawUrls 数组
      if (rawUrls.length > 0) {
        await this.r2Util.bulkUploadFromUrls(
          this.bucketName,
          rawUrls,
          uploadPath
        );
        console.log(`第 ${i + 1} 块上传完成`);
      }

      // 休眠 5 秒
      console.log("等待 5 秒...");
      await this.sleep(5000); // 休眠 5 秒
    }
  }
  // 休眠函数
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = SyncImages;
