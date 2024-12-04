const AWS = require("aws-sdk");
const axios = require("axios");
const path = require("path");

// 设置 AWS 配置（Cloudflare R2 配置）
class R2Util {
  constructor(accessKeyId, secretAccessKey, endpoint) {
    this.r2 = new AWS.S3({
      accessKeyId: accessKeyId, // 替换为你的访问密钥 ID
      secretAccessKey: secretAccessKey, // 替换为你的密钥
      endpoint: endpoint, // 替换为你的 R2 端点
      region: "auto", // 默认的 region
      signatureVersion: "v4",
    });
  }

  // 获取文件的 Content-Type
  getContentType(filePath) {
    const extname = path.extname(filePath).toLowerCase();

    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".txt": "text/plain",
      ".html": "text/html",
      ".json": "application/json",
      ".mp4": "video/mp4",
      ".pdf": "application/pdf",
      ".zip": "application/zip",
    };

    return mimeTypes[extname] || "application/octet-stream";
  }

  // 检查桶的总大小并删除最早的文件直到总大小不超过8GB maxSize = 8 * 1024 * 1024 * 1024
  async checkAndDeleteOldFiles(bucketName, maxSize = 8 * 1024 * 1024 * 1024) {
    console.log(`开始检查桶 ${bucketName} 的总大小...`);

    const params = {
      Bucket: bucketName,
    };

    try {
      // 获取桶中所有对象
      const data = await this.r2.listObjectsV2(params).promise();
      const files = data.Contents;

      // 计算总大小
      let totalSize = files.reduce((acc, file) => acc + file.Size, 0);
      console.log(`当前桶中的总大小为: ${totalSize / (1024 * 1024 * 1024)} GB`);

      // 如果总大小超过限制，则开始删除文件
      if (totalSize > maxSize) {
        console.log(
          `桶中数据超过了 ${
            maxSize / (1024 * 1024 * 1024)
          } GB，开始删除最早上传的文件...`
        );

        // 按上传时间排序（最早上传的文件在前）
        files.sort((a, b) => a.LastModified - b.LastModified);

        // 删除最早的文件直到大小不超过限制
        for (const file of files) {
          totalSize -= file.Size;
          const deleteParams = {
            Bucket: bucketName,
            Key: file.Key,
          };
          await this.r2.deleteObject(deleteParams).promise();
          console.log(`已删除文件: ${file.Key}`);
          if (totalSize <= maxSize) {
            console.log(
              `删除完成，桶中的总大小已降至 ${
                totalSize / (1024 * 1024 * 1024)
              } GB`
            );
            break; // 总大小小于等于 8GB，停止删除
          }
        }
      } else {
        console.log(`桶中的数据大小没有超过限制，无需删除`);
      }
    } catch (error) {
      console.error("检查和删除文件时出错:", error);
    }
  }

  // 批量从网络地址上传文件，允许指定存储路径（但文件名与原文件名一致）
  async bulkUploadFromUrls(bucketName, fileUrls, uploadPath = "") {
    console.log(`开始批量上传 ${fileUrls.length} 个文件到桶 ${bucketName}...`);

    // 在上传前检查并删除文件
    await this.checkAndDeleteOldFiles(bucketName);

    // 直接使用文件 URL 数组来进行上传
    const uploadPromises = fileUrls.map((fileUrl) => {
      console.log(`开始下载文件 ${fileUrl} 并上传到桶 ${bucketName}...`);
      return this.downloadAndUploadFile(fileUrl, bucketName, uploadPath); // 传递 uploadPath
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log("批量上传完成:", results);
    } catch (error) {
      console.error("批量上传时出错:", error);
    }
  }

  // 下载并上传单个文件，允许指定上传路径
  async downloadAndUploadFile(url, bucketName, uploadPath = "") {
    console.log(`开始下载文件: ${url}`);

    try {
      // 下载文件
      const response = await axios.get(url, { responseType: "stream" });
      console.log(`文件 ${url} 下载成功，开始上传...`);

      // 从 URL 中移除查询参数部分
      const cleanUrl = url.split("?")[0]; // 获取 URL 中 ? 前面的部分

      // 从清除参数后的 URL 中提取文件名
      const fileName = path.basename(cleanUrl);

      console.log(`上传的文件名将为: ${fileName}`);

      // 如果指定了上传路径，构建完整路径（替换反斜杠为正斜杠）
      const fullPath = uploadPath
        ? path.join(uploadPath, fileName).replace(/\\/g, "/")
        : fileName;
      console.log(`文件将上传至路径: ${fullPath}`);

      // 获取文件类型
      const contentType = this.getContentType(fileName);

      // 上传到 Cloudflare R2，文件名与原文件名一致
      const params = {
        Bucket: bucketName,
        Key: fullPath, // 使用指定的上传路径
        Body: response.data,
        ContentType: contentType, // 设置文件类型
      };

      const result = await this.r2.upload(params).promise();
      console.log(`文件 ${fileName} 上传成功`);
      return result;
    } catch (error) {
      console.error(`下载并上传文件失败: ${url}`, error);
      throw error;
    }
  }

  // 检查桶中是否存在图片文件
  async hasImageFiles(bucketName, folderName = "") {
    console.log(
      `开始检查桶 ${bucketName} 下路径 ${folderName} 是否存在图片文件...`
    );

    const params = {
      Bucket: bucketName,
      Prefix: folderName, // 文件夹路径前缀
    };

    try {
      // 列出文件夹中的所有文件
      const data = await this.r2.listObjectsV2(params).promise();
      const files = data.Contents;

      if (files.length === 0) {
        console.log("桶中没有文件");
        return false;
      }

      // 过滤出图片文件（jpg, png, gif, jpeg, avif）
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".avif"];
      const imageFiles = files.filter((file) => {
        return imageExtensions.some(
          (ext) => file.Key.toLowerCase().endsWith(ext) // 使用 endsWith 来判断文件扩展名
        );
      });

      if (imageFiles.length > 0) {
        console.log(`桶中存在图片文件`);
        return true;
      } else {
        console.log("桶中没有图片文件");
        return false;
      }
    } catch (error) {
      console.error("检查桶是否存在图片文件时出错:", error);
      return false;
    }
  }

  // 检查桶的总大小是否超过 8GB
  async isBucketSizeOverLimit(bucketName, maxSize = 8 * 1024 * 1024 * 1024) {
    console.log(
      `开始检查桶 ${bucketName} 的总大小是否超过 ${
        maxSize / (1024 * 1024 * 1024)
      } GB...`
    );

    const params = {
      Bucket: bucketName,
    };

    try {
      // 获取桶中所有对象
      const data = await this.r2.listObjectsV2(params).promise();
      const files = data.Contents;

      // 计算总大小
      let totalSize = files.reduce((acc, file) => acc + file.Size, 0);
      console.log(`当前桶中的总大小为: ${totalSize / (1024 * 1024 * 1024)} GB`);

      // 判断桶的总大小是否超过限制
      if (totalSize > maxSize) {
        console.log(`桶的总大小超过了 ${maxSize / (1024 * 1024 * 1024)} GB`);
        return true;
      } else {
        console.log(`桶的总大小没有超过限制`);
        return false;
      }
    } catch (error) {
      console.error("检查桶大小时出错:", error);
      return false;
    }
  }

  // 单个删除文件
  async deleteFile(bucketName, fileName) {
    console.log(`开始删除文件: ${fileName}`);

    const params = {
      Bucket: bucketName,
      Key: fileName,
    };

    try {
      const result = await this.r2.deleteObject(params).promise();
      console.log(`文件 ${fileName} 删除成功`, result);
    } catch (error) {
      console.error(`删除文件 ${fileName} 时出错`, error);
    }
  }

  // 批量删除文件
  async bulkDelete(bucketName, fileNames) {
    console.log(`开始批量删除 ${fileNames.length} 个文件...`);

    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: fileNames.map((fileName) => ({ Key: fileName })),
      },
    };

    try {
      const result = await this.r2.deleteObjects(deleteParams).promise();
      console.log("批量删除完成:", result);
    } catch (error) {
      console.error("批量删除文件时出错:", error);
    }
  }

  // 获取某个路径下的随机图片文件路径
  async getRandomImagePath(bucketName, folderName) {
    console.log(
      `开始获取桶 ${bucketName} 下路径 ${folderName} 的随机图片文件...`
    );

    const params = {
      Bucket: bucketName,
      Prefix: folderName, // 文件夹路径前缀
    };

    try {
      // 列出文件夹中的所有文件
      const data = await this.r2.listObjectsV2(params).promise();
      const files = data.Contents;

      if (files.length === 0) {
        console.log("目录中没有图片文件");
        return null;
      }

      // 过滤出图片文件（jpg, png, gif, jpeg）
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".avif"];
      const imageFiles = files.filter((file) => {
        return imageExtensions.some(
          (ext) => file.Key.toLowerCase().endsWith(ext) // 使用 endsWith 而不是 endswith
        );
      });

      if (imageFiles.length === 0) {
        console.log("目录中没有图片文件");
        return null;
      }

      // 随机选择一个图片文件
      const randomImage =
        imageFiles[Math.floor(Math.random() * imageFiles.length)];

      // 获取该图片的路径
      const imagePath = randomImage.Key;

      console.log("随机图片的路径:", imagePath);
      return process.env.R2_HOST + "/" + imagePath;
    } catch (error) {
      console.error("获取随机图片路径时出错:", error);
    }
  }
}

module.exports = R2Util;
