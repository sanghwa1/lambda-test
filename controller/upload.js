const express = require('express');
const router = express.Router()
const moment = require('moment/moment');
const crypto = require('crypto');
const AWS = require("aws-sdk");
const db = require('../model');
const S3 = new AWS.S3({signatureVersion: 'v4'});
const env = process.env;
const AWS_BUCKET_NAME = env.AW_BUCKET_NAME; 

router.post('/', async function(req, res, next) {
  
  try{
    const key = req.query.key === 'lotteHome';
    const fileName = req.body.fileName;
    
    if(!key) return sendErrorResponse(res, '인증에 실패하였습니다.', 401);
    if(!fileName) return sendErrorResponse(res, '유효하지 않은 파일명입니다.', 400);

    const company = await db.company.findOne({where: {code:env.COMPANY_CODE}});
    if(!company) return sendErrorResponse(res, '존재하지 않은 회사 코드입니다.', 404);;

    const mediaCode = makeMediaCode();
    const createDate = {
      user: {
        id: 'system',
        name: 'system',
      },
      time: {
        utc: moment.utc(),
        kr: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
    };

    const {uploadSignedURL, uploadParams} = await makeUploadSignedURL(mediaCode, fileName)
    
    await db.media.create({
      code: mediaCode,
      title: fileName,
      companyCode: company.code,
      created: createDate,
      updated: createDate,
      origin: createOriginData(mediaCode, fileName, uploadParams, createDate),
      transcodingStatus: 'waiting',
      deleteStatus:0
    })

    return res.status(200).json({
      mediaCode,
      uploadURL: uploadSignedURL
    });

  } catch(err){
    console.log(`Post - upload-url - Function ${err?.function}() Err -`,JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return sendErrorResponse(res, 'Server Error.', 500);
  }
});

const makeUploadSignedURL = async (mediaCode, fileName) => {
  try{
    const now = moment();
    const year = now.format('YYYY');
    const monthDay = now.format('MMDD');
    
    const uploadParams = { 
      Bucket: AWS_BUCKET_NAME,
      Key: `${year}/${monthDay}/${mediaCode}/${fileName}`,
      Expires: 60 * 10, // 10분
    }; 
    return {
      uploadSignedURL: await S3.getSignedUrlPromise("putObject", uploadParams),
      uploadParams
    }
  }catch(err){
    const customError = new Error(err);
    customError.function = makeUploadSignedURL.name;
    throw customError;
  };
}

const createOriginData = (mediaCode, fileName, uploadParams, createDate) => {
  try{
    const extension = fileName.split('.').at(-1);
    return {
      code: mediaCode,
      type: 'origin',
      bucket: uploadParams.Bucket,
      key: uploadParams.Key,
      fileName: fileName,
      extension,
      position: '00:00:00.0',
      index: 0,
      created: createDate,
      default: true,
    };
  }catch(err){
    const customError = new Error(err);
    customError.function = createOriginData.name;
    throw customError;
  };
}


const makeMediaCode = () => `M${moment().format('YYYYMMDDHHmmssSSS')}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
const sendErrorResponse = (res, errorMessage, status) => res.status(status).json({ errorMessage });



module.exports = router;