const excelController = require("../controller/excelController");

/**
 * path param 사용법
 * ex) path: /\/employee\/([0-9a-z]+)/
 * */
const route = [
    {
        method: 'POST',
        path: '/excel/v1/public-file',
        action: excelController.createPublic.bind(excelController)
    },
    {
        method: 'POST',
        path: '/excel/v1/protect-file',
        action: excelController.createProtect.bind(excelController)
    },
    {
        method: 'POST',
        path: '/excel/v1/encrypt-only',
        action: excelController.encrypt.bind(excelController)
    },
]

module.exports = route