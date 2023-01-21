const axios = require("axios").default;

async function getResponse(url) {
  try {
    const res = await axios.get(url);
    return {
      success: true,
      status: res.status,
      data: res.data,
    };
  } catch (error) {
    if (error.response?.status !== 404) {
      console.log(`[AXIOS ERROR]\nURL: ${url}\n${error}\n`);
    }
    return {
      success: false,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}

async function downloadImage(url) {
  try {
    const res = await axios.get(url, {
      responseType: "stream",
    });
    return res.data;
  } catch (error) {
    console.log(`[AXIOS ERROR]\nURL: ${url}\n${error}\n`);
  }
}

module.exports = {
  getResponse,
  downloadImage,
};