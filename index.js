// https://www.npmjs.com/package/lambda-api

const api = require("lambda-api")();
const excelController = require("./src/controller/excelController");
const returnResult = function (result, res) {
    res.status(result.statusCode);
    for(let header in result.headers) {
        res.header(header);
    }
    res.send(result.body);
    return res;
}

api.post("/excel/v1/public-file", async (req, res) => {
    const result = await excelController.createPublic(req, res, JSON.stringify(req.body))
    return returnResult(result, res);
})

api.post("/excel/v1/protect-file", async (req, res) => {
    const result = await excelController.createProtect(req, res, JSON.stringify(req.body))
    return returnResult(result, res);
})

api.post("/excel/v1/encrypt-only", async (req, res) => {
    const result = await excelController.encrypt(req, res, JSON.stringify(req.body))
    return returnResult(result, res);
})

exports.handler = async function (event, context) {
    return api.run(event, context);
};