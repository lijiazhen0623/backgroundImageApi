function setBackground() {
  fetch("/api/vertical")
    .then((response) => response.blob())
    .then((imageBlob) => {
      const imageObjectURL = URL.createObjectURL(imageBlob);
      document.body.style.backgroundImage = `url(${imageObjectURL})`;
    })
    .catch((error) => console.error("Error fetching the image:", error));
}

// 初始设置背景图
setBackground();

// 每隔10秒请求一次新的背景图
setInterval(setBackground, 15000);
