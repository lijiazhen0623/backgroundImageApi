function setBackground(apiUrl) {
  fetch(apiUrl)
    .then((response) => response.blob())
    .then((imageBlob) => {
      const imageObjectURL = URL.createObjectURL(imageBlob);
      document.body.style.backgroundImage = `url(${imageObjectURL})`;
    })
    .catch((error) => console.error("Error fetching the image:", error));
}

function detectOrientation() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const apiUrl = isPortrait
    ? "/api/vertical"
    : "/api/horizontal";
  setBackground(apiUrl);
}

// 初始设置背景图
detectOrientation();

// 每10秒钟判断并请求一次
setInterval(detectOrientation, 15000);
