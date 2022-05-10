const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const fs = require("fs");
const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3')
const client = new S3Client({region: 'ap-northeast-1'}) // Pass in opts to S3 if necessary
import { Readable } from 'stream';

class S3Service {

    constructor(bucketName) {
        this.bucketName = bucketName;
        this.acl = "public-read";
        this.contentType = 'application/CSV';
        this.storageClass = 'STANDARD';
    }

    // 대용량 업로드
    async uploadLargeFile(filePath, key) {
        // UploadId 반환
        let multipartCreateResult = await S3.createMultipartUpload({
            Bucket: this.bucketName,
            Key: key,
            ACL: this.acl,
            ContentType: this.contentType,
            StorageClass: this.storageClass
        }).promise();

        let chunkCount = 1;
        let CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
        let buffer = Buffer.alloc(CHUNK_SIZE);
        let uploadPartResults = []

        fs.open(filePath, 'r', function (err, fd) {
            if (err) throw err;

            function readNextChunk() {
                fs.read(fd, buffer, 0, CHUNK_SIZE, null, async function (err, nread) {
                    if (err) throw err;

                    if (nread === 0) {
                        // done reading file, do any necessary finalization steps
                        fs.close(fd, function (err) {
                            if (err) throw err;
                        });
                        return;
                    }

                    var data;

                    if (nread < CHUNK_SIZE) {
                        data = buffer.slice(0, nread);
                    } else {
                        data = buffer;
                    }

                    let uploadPromiseResult = await S3.uploadPart({
                        Body: data,
                        Bucket: this.bucketName,
                        Key: key,
                        PartNumber: chunkCount,
                        UploadId: multipartCreateResult.UploadId,
                    }).promise()

                    uploadPartResults.push({
                        PartNumber: chunkCount,
                        ETag: uploadPromiseResult.ETag
                    })

                    chunkCount++;

                    readNextChunk()
                });
            }

            readNextChunk();
        });

        let completeUploadResponce = await S3.completeMultipartUpload({
            Bucket: this.bucketName,
            Key: key,
            MultipartUpload: {
                Parts: uploadPartResults
            },
            UploadId: multipartCreateResult.UploadId
        }).promise()

        console.log(completeUploadResponce);
        return completeUploadResponce;
    }

// {
//     "fullPath": "https://store-excel-file.s3.ap-northeast-1.amazonaws.com/",
//     "key": "brandi/admin/28a0d821-5ac5-41ca-b552-9f516903bbbd/상품관리_전체상품_엑셀다운로드_20220510.xlsx"
// }
    async streamToString (stream) {
        return await new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        });
    }
    // 대용량 다운로드
    async downloadFile(Key) {
        const Bucket = this.bucketName
        return new Promise(async (resolve, reject) => {
            const getObjectCommand = new GetObjectCommand({Bucket, Key})

            try {
                const response = await client.send(getObjectCommand)

                // Store all of data chunks returned from the response data stream
                // into an array then use Array#join() to use the returned contents as a String
                let responseDataChunks = []

                // Handle an error while streaming the response body
                response.Body.once('error', err => reject(err))

                // Attach a 'data' listener to add the chunks of data to our array
                // Each chunk is a Buffer instance
                response.Body.on('data', chunk => responseDataChunks.push(chunk.toString('utf8')))

                // Once the stream has no more data, join the chunks into a string and return the string
                response.Body.once('end', () => resolve(responseDataChunks.join('')))
            } catch (err) {
                // Handle the error or throw
                return reject(err)
            }
        })
    }
}

module.exports = S3Service;