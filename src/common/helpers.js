const {getDownloadFilename} = require("../service/commonService");

module.exports.validationError = (res, error = 'Data provided is not valid') => {
    const response = {
        statusCode: 422,
        headers: {
            'Content-type': 'application/json',//you can change any content type
        },
        body: {
            result: false,
            error
        }
    }

    return response;
};

module.exports.error = (res, error = 'An unknown error occurred', statusCode = 500) => {
    const response = {
        statusCode: statusCode,
        headers: {
            'Content-type': 'application/json',//you can change any content type
        },
        body: {
            result: false,
            error
        }
    }

    return response;
};

module.exports.success = (res, data = null) => {
    const response = {
        statusCode: 200,
        headers: {
            'Content-type': 'application/json',//you can change any content type
        },
        body: {
            result: true,
            data
        }
    }

    return response;
};

module.exports.successFile = (req, data = null, filename) => {
    const response = {
        statusCode: 200,
        headers: {
            'Content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',//you can change any content type
            'content-disposition': `attachment; filename=${getDownloadFilename(req, filename)}.xlsx`,
        },
        body: Buffer.from(data).toString('base64'),
        "isBase64Encoded": true,
    }

    return response;
};
