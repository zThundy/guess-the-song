const path = require('path');

const getPath = (dir) => {
    const base = "./src/";
    const _path = path.resolve(__dirname, base + dir);
    console.log(_path);
    return _path;
}

module.exports = {
    // typescript support to craco
    typescript: {
        enableTypeChecking: true,
    },
    webpack: {
        alias: {
            '@root': getPath(""),
            '@helpers': getPath("helpers"),
        },
    },
  };