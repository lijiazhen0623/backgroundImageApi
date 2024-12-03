module.exports = {
  api1: {
    baseUrl: process.env.API1PAN_BASEURL,
    clientSecret: process.env.API1PAN_CLIENT_SECRET,
    clientID: process.env.API1PAN_CLIENT_ID,
    Platform: process.env.API1PAN_PLATFORM,
  },
  api2: {
    baseUrl: process.env.API2ALIST_BASEURL,
    alistToken: process.env.API2ALIST_TOKEN,
    horizontalImageRootPath: process.env.API2ALIST_HORIZONTALIMAGEROOTPATH,
    verticalImageRootPath: process.env.API2ALIST_VERTICALIMAGEROOTPATH,
  },
};
