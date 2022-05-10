const {fromBlankAsync, fromDataAsync} = require('xlsx-populate');
const fs = require("fs");
const { Readable } = require('stream');

const createWorkBook = function (headers, contents) {
    return fromBlankAsync()
        .then(workbook => {
            let count = 1;

            // 헤더 스타일 지정
            for (let header of headers) {
                workbook.sheet(0).row(1).cell(count).value(header).style("fill", "FFFFCC")
                ++count;
            }

            // 엑셀 내용
            for (let [index, row] of contents.entries()) {
                let count = 1;
                for (let item in row) {
                    workbook.sheet(0).row(index+2).cell(count).value(row[item])
                    ++count;
                }
            }

            // 시트명 날짜
            workbook.sheet(0).name(getSheetName());
            return workbook;
        });
}

const excelExport = async function (workbook, password = null) {
    // return to buffer
    if(password) {
        return await workbook.outputAsync({password: password});
    } else {
        return await workbook.outputAsync();
    }
}
function streamToString (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}

const utf8 = require('utf8');
const parsingExcelData = async function (bufferedData) {
    return fromDataAsync(bufferedData);

    const stream = Readable.from(bufferedData);
    console.log(stream)

    let excelDataBuffer
    let bufs = [];
    stream.on('data', function(d){
        bufs.push(d);
    });
    stream.on('end', function(){
        excelDataBuffer = Buffer.concat(bufs);

        return fromDataAsync(excelDataBuffer);
    });
}

function getSheetName() {
    const source = new Date();
    const year = source.getFullYear();
    const month = source.getMonth() + 1;
    const day = source.getDate();
    return [year, month, day].join('-').toString();
}

module.exports = {createWorkBook, excelExport, parsingExcelData}

