const fs = require('fs');
const s3 = require('@config/aws');

async function uploadFileToS3(filePath, fileName) {
    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${process.env.FOLDER_NAME}/${fileName}`,
        Body: fileContent,
    };
    try {
        const data = await s3.upload(params).promise();
        console.log(`File uploaded successfully. S3 URL: ${data.Location}`);
        return data.Location;
    } catch (err) {
        console.error("Error uploading file to S3:", err.message);
        throw err;
    }
}

module.exports = { uploadFileToS3 };
