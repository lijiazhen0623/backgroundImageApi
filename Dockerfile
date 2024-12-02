FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json 复制到容器中
COPY package*.json ./

# 设置 npm 源，加速依赖安装
RUN npm config set registry https://mirrors.huaweicloud.com/repository/npm/

# 安装依赖
RUN npm install


# 复制项目文件
COPY . . 

# 暴露容器的 3000 端口
EXPOSE 3000

# 启动应用
CMD ["node", "./src/server.js"]
