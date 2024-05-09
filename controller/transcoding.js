const express = require('express');
const router = express.Router();
const moment = require('moment/moment');
const Sequelize = require('sequelize');
const fs = require('fs');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const AWS = require("aws-sdk");
const S3 = new AWS.S3({signatureVersion: 'v4'});
const db = require('../model');
const env = process.env;
const AWS_BUCKET_NAME = env.AW_BUCKET_NAME; 
const mediaconvert = new AWS.MediaConvert();
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

const route53URL = `https://${env.AW_ROUTE53}`;

router.post('/:mediaCode', async function(req, res, next) {
  try{
    const company = await db.company.findOne({where: {code:env.COMPANY_CODE}});
    if(!company) return sendErrorResponse(res, '존재하지 않은 회사 코드입니다.', 404);;

    const mediaCode = req.params.mediaCode;  
    if(!mediaCode) return sendErrorResponse(res, '유효하지 않은 미디어 코드입니다.', 400);

    const media = await db.media.findOne({where: {code:mediaCode}});
    if(!media) return sendErrorResponse(res, '미디어가 존재하지 않습니다.', 404);

    const asset = await db.asset.findAll({
      where: {
        mediaCode,
        type: {
          [Sequelize.Op.not]: 'origin'
        }
      }
    });
    if(asset) return sendErrorResponse(res, '이미 해당 미디어 코드에 미디어가 존재합니다.', 409);

    const originData = JSON.parse(media.origin);
    originData.mediaCode = media.code;
    originData.s3ParentPath = originData.key.replace(`/${originData.fileName}`,'');
    originData.bucketURL = `https://s3-${AWS.config.region}.amazonaws.com/${originData.bucket}`;
    originData.default = 1;
    
    const getParams = {
      Bucket: originData.bucket,
      Key: originData.key
    };
    await S3.headObject(getParams).promise();
    
    // ffprobe 영상 정보 조회
    const videoFfprobeData = await getMediaInfo(`${originData.bucketURL}/${originData.key}`);
    // asset insert part(origin)
    await db.asset.create(createAssetData(originData, videoFfprobeData));
    
    const thumbnailFileDataArr = await makeThumbnails(originData, videoFfprobeData);
    const thumbnailDataArr = await uploadThumbnailToS3(originData, thumbnailFileDataArr);
    // asset insert part(thumbnail)
    await db.asset.bulkCreate(thumbnailDataArr);
    
    // request transcoding
    const { jobID, requestParams } = await requestTranscoding(originData, company);
    await db.media.update({ 
      origin: updateOriginData(originData, videoFfprobeData),
      duration: videoFfprobeData.format.duration,
      transcodingJob: [requestParams],
      transcodingJobID: jobID,
      transcodingStatus: 'transcoding'
      },{
      where: {
        code: media.code,
      },
    })

    const thumbnails = await db.asset.findAll({
      attributes: [['width', 'size'], ['cdnUrl', 'url']],
      where: {
        mediaCode: media.code,
        type: 'thumbnail'
      }
    })

    return res.status(200).send(thumbnails)
  }catch(err){
    console.log(`Post - transcoding - Function ${err?.function}() Err -`, JSON.stringify(err, Object.getOwnPropertyNames(err)));
    if(err?.code === 'NotFound') return sendErrorResponse(res, '해당 파일이 존재하지 않습니다.', 404);
    return sendErrorResponse(res, 'Server Error.', 500)
  }

});

const sendErrorResponse = (res, errorMessage, status) => res.status(status).json({ errorMessage });

const getMediaInfo = async (target) => {
  try{
    const {stdout} = await exec(`/opt/homebrew/bin/ffprobe -i '${target}' -print_format json -show_format -show_streams -v quiet`);
    return JSON.parse(stdout);
  }catch(err){
    const customError = new Error(err);
    customError.function = getMediaInfo.name;
    throw customError;
  };
};  

const makeThumbnails = async (originData, videoInfo) => {
  try{
    const middleDuration = Math.floor(Number(videoInfo.format.duration) / 2);
    const resolutions = ['160:90', '320:180', '640:360'];
    const fileInfos = [];
    let addCommand = '';
  
    for(const resolution of resolutions) {
      const exceptionExtentionName =  originData.fileName.split('.').slice(0, -1).join('.');
      const resolutionSplit = resolution.split(':')[0];
      const fileName = `${exceptionExtentionName}_${resolutionSplit}.jpg`
      const filePath = `${env.AW_STAGE === 'local' ? './temp' : '/temp'}/${fileName}`;
      fileInfos.push({fileName, filePath});
      addCommand +=`-ss ${middleDuration} -vframes 1 -vf "scale=${resolution}" -q:v 2 ${filePath} `;
    }
  
    // ffmpeg 썸네일 추출
    await exec(`/opt/homebrew/bin/ffmpeg -i '${originData.bucketURL}/${originData.key}' ${addCommand}`);
    return fileInfos;
  }catch(err){
    const customError = new Error(err);
    customError.function = makeThumbnails.name;
    throw customError;
  }
}

const uploadThumbnailToS3 = async (originData, thumbnailFileDataArr) => {
  try{
    const thumbnailDataArr = [];
    // 추출한 썸네일 s3로 업로드
    const uploadPromises = thumbnailFileDataArr.map(async (thumbnailFileData, index) => { 
      const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Key: `${originData.s3ParentPath}/${thumbnailFileData.fileName}`, 
        Body: fs.createReadStream(thumbnailFileData.filePath)
      };
      await S3.upload(uploadParams).promise();
      const thumbnailFfprobData = await getMediaInfo(thumbnailFileData.filePath);
      
      const thumbnailData = Object.assign({}, originData);
      thumbnailData.type = 'thumbnail';
      thumbnailData.fileName = thumbnailFileData.fileName;
      thumbnailData.extension = thumbnailFileData.fileName.split('.').at(-1);
      thumbnailData.key = uploadParams.Key;
      thumbnailData.default = index === 0 ? 1 : 0;
      thumbnailDataArr.push(createAssetData(thumbnailData, thumbnailFfprobData));
    });
    await Promise.all(uploadPromises);
    return thumbnailDataArr;
  }catch(err){
    const customError = new Error(err);
    customError.function = uploadThumbnailToS3.name;
    throw customError;
  }
}

const createAssetData = (assetData, mediaFfprobData) => {
  try{
    return {
      mediaCode: assetData.mediaCode,      
      type: assetData.type,          
      bucket: assetData.bucket,
      key: assetData.key,            
      fileName: assetData.fileName,  
      extension: assetData.extension,
      position: assetData.position,  
      s3Url: `${assetData.bucketURL}/${assetData.key}`,
      httpUrl: `${route53URL}/${assetData.key}`,
      cdnUrl: `${route53URL}/${assetData.key}`,
      width: mediaFfprobData.streams[0].width,
      height: mediaFfprobData.streams[0].height,
      fileSize: mediaFfprobData.format.size,
      default: assetData.default,
      created: createDate,
      deleteStatus: 0,
      index: 0,
    }
  }catch(err){
    const customError = new Error(err);
    customError.function = createAssetData.name;
    throw customError;
  }
}

const updateOriginData = (originData, mediaFfprobeData) => {
  try{
    return {
      ...originData,
      s3Url: `${originData.bucketURL}/${originData.key}`,
      httpUrl: `${route53URL}${originData.key}`,
      cdnUrl: `${route53URL}${originData.key}`,
      width: mediaFfprobeData.streams[0].width,
      height: mediaFfprobeData.streams[0].height,
      fileSize: mediaFfprobeData.format.size,
      displayAspectRatio: mediaFfprobeData.format.displayAspectRatio,
      metadata: mediaFfprobeData.format,
    };
  }catch(err){
    const customError = new Error(err);
    customError.function = updateOriginData.name;
    throw customError;
  };
}

const requestTranscoding = async (originData, company) => {
  try{
    const companyConfig = JSON.parse(company.config);
    const profile = await db.profile.findOne({where: {companyCode:env.COMPANY_CODE}});
    const params = {
      Queue: env.AW_MC_QUEUE,
      Role: env.AW_MC_ROLE,
      JobTemplate: env.AW_MC_JOBTEMPLATE,
      UserMetadata :{
        mediaCode: originData.mediaCode,
        profileNames: profile ? profile.code : "lotte-1000k",
        abrProfileNames: "",
        callbackUrl:  companyConfig.transcoder.software.mediaConvert.callback.complete.url,
        callbackFailUrl:  companyConfig.transcoder.software.mediaConvert.callback.fail.url,
      },
      Settings: {
        OutputGroups: [
          {
            Name: 'File Group',
            OutputGroupSettings: {
              Type: 'FILE_GROUP_SETTINGS',
              FileGroupSettings: {
                Destination: `s3://${originData.bucket}/${originData.s3ParentPath}/`
              }
            },
            Outputs: [
              {
                Extension: '.mp4',
                NameModifier: '_transcoding'
              }
            ]
          }
        ],
        Inputs: [
          {
            FileInput: `${originData.bucketURL}/${originData.key}` // 입력 파일의 S3 경로를 입력합니다.
          }
        ]
      }
    }
    const transcodingInfo = await mediaconvert.createJob(params).promise();
    return {
      jobID : transcodingInfo.Job.Id,
      requestParams: params
    };
  }catch(err){
    const customError = new Error(err);
    customError.function = requestTranscoding.name;
    throw customError;
  };

}

module.exports = router;
