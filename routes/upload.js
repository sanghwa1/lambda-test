const express = require('express');
const AWS = require("aws-sdk");
const moment = require('moment/moment');
const crypto = require('crypto');
const { getCurrentInvoke } = require('@codegenie/serverless-express');

const router = express.Router();
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const STORAGE_BUCKET_NAME = `sanghwa-test`; 
AWS.config.update({ region: "ap-northeast-2" });

router.post('/', async function(req, res, next) {
  try{
    const key = req.query.key;
    const fileName = req.body.fileName;
    const tempValue = 'lotteHome';
    const errorData = {
      errorMessage: null
    };
    if(key !== tempValue) {
      errorData.errorMessage = '인증에 실패하였습니다.';
      res.status(401).json({errorData});
    };
    if(!fileName) {
      errorData.errorMessage = '유효하지 않은 파일명입니다.';
      res.status(400).json({errorData});
    };

    const mediaCode = `M${moment().format('YYYYMMDDHHmmssSSS')}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    
    // TODO: 가 데이터 생성 로직 필요

    const YYYYMMDD = moment().format('YYYYMMDD');
    const params = { 
      Bucket: STORAGE_BUCKET_NAME,
      Key: `${YYYYMMDD}/${fileName}`,
      Expires: 60 * 10, // 10분
    };
    const signedUrl = await s3.getSignedUrlPromise("putObject", params)
    
    res.status(200).json({
      mediaCode,
      uploadURL: signedUrl
    });

  } catch(err){
    errorData.errorMessage = 'Server Error.';
    console.log(`err - ${JSON.stringify(err)}`)
    res.status(500).json({errorData});
  }
});

module.exports = router;