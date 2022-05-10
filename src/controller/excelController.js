const AWS = require("aws-sdk");

const helpers = require("../common/helpers");
const workbookService = require("../service/workbookService");
const commonService = require("../service/commonService");
const s3Service = require("../service/awsS3Service");
const {decryptPassword} = require("../utils/crypto");
const S3Service = require("../service/awsS3Service");

class ExcelController {
    /**
     *  공개 엑셀파일 생성 /excel/v1/public-file
     */
    async createPublic(req, res, postData, param) {
        postData = JSON.parse(postData);
        let {headers = null, contents = null, fileName} = postData;

        try {
            if (!headers || !contents) {
                return helpers.validationError(res, 'headers, contents 는 필수값 입니다.')
            }

            // 파일명 기본생성
            if (!fileName) {
                fileName = `brandi_${new Date().toLocaleDateString()}`;
            }

            // 간혹 {'헤더명1', '헤더명2' ...} 로 오는 경우가 있음
            if (!Array.isArray(headers) && typeof headers === 'object') {
                let array = [];
                for (let header of headers) {
                    array.push(header);
                }
                headers = array;
            }

        } catch (error) {
            return helpers.validationError(res, '잘못된 요청입니다.')
        }

        try {
            // 엑셀 파일 생성
            console.log("Create public-excel file start");
            let start = new Date();
            let workbook = await workbookService.createWorkBook(headers, contents);

            if (!workbook) {
                return helpers.error(res, "엑셀 파일 생성중 에러가 발생했습니다");
            }

            const excelFile = await workbookService.excelExport(workbook);

            if (!excelFile) {
                return helpers.error(res, "엑셀 파일 생성중 에러가 발생했습니다");
            }

            let end = new Date();
            console.log("Create public-excel file end")
            console.info(`Time taken to create: ${end - start}ms`)

            let data = commonService.createStream(excelFile);
            return helpers.successFile(req, excelFile, fileName);

        } catch (error) {
            console.log(error);
            return helpers.error(res);
        }
    }

    /**
     *  비공개 엑셀파일 생성 /excel/v1/protect-file
     */
    async createProtect(req, res, postData, param) {
        postData = JSON.parse(postData);
        let {headers = null, contents = null, fileName, password = null} = postData;

        try {
            if (!headers || !contents || !password) {
                return helpers.validationError(res, 'headers, contents, password 는 필수값 입니다.')
            }

            // 파일명 기본생성
            if (!fileName) {
                fileName = `brandi_${new Date().toLocaleDateString()}`;
            }

            // 간혹 {'헤더명1', '헤더명2' ...} 로 오는 경우가 있음
            if (!Array.isArray(headers) && typeof headers === 'object') {
                let array = [];
                for (let header of headers) {
                    array.push(header);
                }
                headers = array;
            }

        } catch (error) {
            return helpers.validationError(res, '잘못된 요청입니다.')
        }

        try {
            // 엑셀 파일 생성
            console.log("Create protect-excel file start");
            let start = new Date();
            let workbook = await workbookService.createWorkBook(headers, contents);

            if (!workbook) {
                return helpers.error(res, "엑셀 파일 생성중 에러가 발생했습니다");
            }

            // const decryptedPassword = decryptPassword(password);
            // if (!decryptedPassword) {
            //     return helpers.error(res, '엑셀 비밀번호 생성 실패')
            // }

            // 암호화 비밀번호 해독
            const excelFile = await workbookService.excelExport(workbook, password);

            if (!excelFile) {
                return helpers.error(res, "엑셀 파일 생성중 에러가 발생했습니다");
            }

            let end = new Date();
            console.log("Create protect-excel file end")
            console.info(`Time taken to create: ${end - start}ms`)

            let data = commonService.createStream(excelFile);
            return helpers.successFile(req, excelFile, fileName);

        } catch (error) {
            return helpers.error(res);
        }
    }

    /**
     *  파일 비밀번호 암호화 /excel/v1/encrypt-only
     */

    // https://olotintemitope.medium.com/how-to-upload-files-to-amazon-s3-using-nodejs-lambda-and-api-gateway-bae665127907
    async encrypt(req, res, postData, param) {
        postData = JSON.parse(postData);
        try {
            let {fullPath = null, key = null, password = null} = postData;

            if (!fullPath || !key) return helpers.validationError(res);

            // const bucket = process.env.BUCKET;
            const bucket = 'store-excel-file';
            let S3 = new S3Service(bucket);

            console.log("Start download excel file from S3");
            let file = await S3.downloadFile(key)
                .then(res => {
                    console.log("Success to download excel file from S3");
                    return res;
                })
                .catch(error => {
                    console.log("Fail to download excel file from S3");
                    return helpers.error(500, "downloadError e" + error)
                })

            console.log(file.text())
            if(!file) helpers.error(500);

            // 확장자 체크

            // 파일 변환 후 비밀번호 저장
            await workbookService.parsingExcelData(file)
                .then(res => {
                    console.log(res)
                })
                .catch(error => {
                    console.log("Fail to set excel password");
                    console.log(error)
                    return helpers.error(500, "setPasswordError e" + error)
                })


            // await S3.uploadLargeFile()
            //     .then(res => {
            //         console.log("Success to upload file key: " +key)
            //         return helpers.success(200, {Key: res});
            //     })
            //     .catch(error => {
            //         console.log("Fail to upload excel file from S3");
            //         return helpers.error(500, "uploadError e:" + error)
            //     })


            return helpers.success(200);
        } catch (error) {
            console.log(error);
            return helpers.error(res);
        }
    }
}

module.exports = new ExcelController();