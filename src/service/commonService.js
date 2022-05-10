const stream = require("stream");
const iconvLite = require("iconv-lite");

const createStream = function (data) {
    const readStream = new stream.PassThrough();

    var bufferedData = Buffer.from(data, 'base64')
    readStream.end(bufferedData);
    return bufferedData;
}

const getDownloadFilename = function (req, filename) {
    var header = req.headers['user-agent'];

    if (header.includes("MSIE") || header.includes("Trident")) {
        return encodeURIComponent(filename).replace(/\\+/gi, "%20");
    } else if (header.includes("Chrome")) {
        return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    } else if (header.includes("Opera")) {
        return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    } else if (header.includes("Firefox")) {
        return iconvLite.decode(iconvLite.encode(filename, "UTF-8"), 'ISO-8859-1');
    }

    return filename;
}

module.exports = {getDownloadFilename, createStream};