var express = require('express');
var router = express.Router();
var fs = require('fs');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const STORAGE_BUCKET_NAME = `sanghwa-test`; 
AWS.config.update({ region: "ap-northeast-2" });

router.post('/:mediaCode', async function(req, res, next) {
  try{
    const getParams = {
      Bucket: STORAGE_BUCKET_NAME,
      Key:'20240502/test.mp4'
    };
    await s3.headObject(getParams).promise();
    const getSignedURL = s3.getSignedUrl('getObject', getParams);

    const resolutions = ['160:90', '320:180', '640:360'];
    const files = [];
    let addCommand = ''; 
    for(const resolution of resolutions) {
      const resolutionSplit = resolution.split(':')[0];
      const fileName = `test_${resolutionSplit}.jpg`
      const lambdaTempOutput = `./temp/${fileName}`;
      files.push({fileName, lambdaTempOutput});
      addCommand +=`-ss 2 -vframes 1 -vf "scale=${resolution}" -q:v 2 ${lambdaTempOutput} `;
    }
    
    await exec(`/opt/homebrew/bin/ffmpeg -i '${getSignedURL}' ${addCommand}`);
    
    const uploadPromises = files.map(async (file) => {
      const uploadParams = {
        Bucket: STORAGE_BUCKET_NAME,
        Key: `20240503/${file.fileName}`,
        Body: fs.createReadStream(file.lambdaTempOutput)
      };
      await s3.upload(uploadParams).promise();
    });
    await Promise.all(uploadPromises);

    res.status(200).send()
  }catch(err){
    console.log(`Post - transcoding - Err - ${JSON.stringify(err)}`);
    
    let errorMessage = 'Server Error.';
    let status = 500;

    if(err?.code === 'NotFound') {
      errorMessage = '해당 파일이 존재하지 않습니다.';
      status = 404;
    }

    res.status(status).json({errorMessage});
  }

});

module.exports = router;
