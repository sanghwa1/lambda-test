var express = require('express');
var router = express.Router();
var fs = require('fs');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const AWS = require("aws-sdk");
const S3 = new AWS.S3({
  signatureVersion: 'v4'
});
const STORAGE_BUCKET_NAME = `sanghwa-test`;
AWS.config.update({ region: "ap-northeast-2" });
const mediaconvert = new AWS.MediaConvert();

router.post('/:mediaCode', async function(req, res, next) {
  let errorMessage = null;
  let status = 200;
  try{
    const mediaCode = req.params.mediaCode;  
    if(!mediaCode) {
      errorMessage = '유효하지 않은 미디어 코드입니다.';
      status = 400;
      return res.status(status).json({errorMessage});
    };

    const getParams = {
      Bucket: STORAGE_BUCKET_NAME,
      Key:'20240502/test.mp4'
    };
    await S3.headObject(getParams).promise();
    const getSignedURL = await S3.getSignedUrlPromise('getObject', getParams);


    // ffprobe 영상 duration 조회
    const middleDuration = await getMiddleDuration(getSignedURL);

    //TODO: DB 연동하고나서 함수로 분리하자
    // const resolutions = ['160:90', '320:180', '640:360'];
    // const files = [];
    // let addCommand = ''; 
    // for(const resolution of resolutions) {
    //   const resolutionSplit = resolution.split(':')[0];
    //   const fileName = `13_test_${resolutionSplit}.jpg`
    //   const lambdaTempOutput = `./temp/${fileName}`;
    //   files.push({fileName, lambdaTempOutput});
    //   addCommand +=`-ss ${middleDuration} -vframes 1 -vf "scale=${resolution}" -q:v 2 ${lambdaTempOutput} `;
    // }
 
    // // ffmpeg 썸네일 추출
    // await exec(`/opt/homebrew/bin/ffmpeg -i '${getSignedURL}' ${addCommand}`);

    // // 추출한 썸네일 s3로 업로드
    // const uploadPromises = files.map(async (file) => {
    //   const uploadParams = {
    //     Bucket: STORAGE_BUCKET_NAME,
    //     Key: `20240505/${file.fileName}`, //TODO: DB 연동해서 해당 mediaCode를 조회한 다음 경로 잡아주자
    //     Body: fs.createReadStream(file.lambdaTempOutput)
    //   };
    //   await S3.upload(uploadParams).promise();
    // });
    // await Promise.all(uploadPromises);

    const params = {
      Queue: 'arn:aws:mediaconvert:ap-northeast-2:972521143148:queues/lotteON-video-review', 
      Role: 'arn:aws:iam::972521143148:role/service-role/VCAST-DEV-CATENOID-ROLE-MEDIACONVERT', 
      JobTemplate: "arn:aws:mediaconvert:ap-northeast-2:972521143148:jobTemplates/lotteON-video-review",
      Settings: {
        OutputGroups: [
          {
            Name: 'File Group',
            OutputGroupSettings: {
              Type: 'FILE_GROUP_SETTINGS',
              FileGroupSettings: {
                Destination: 's3://sanghwa-test/'
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
            FileInput: getSignedURL // 입력 파일의 S3 경로를 입력합니다.
          }
        ]
      }
    };
  
    await mediaconvert.createJob(params).promise();

    return res.status(status).send()
  }catch(err){
    console.log(`Post - transcoding - Err - ${JSON.stringify(err)}`);
    
    errorMessage = 'Server Error.';
    status = 500;

    if(err?.code === 'NotFound') {
      errorMessage = '해당 파일이 존재하지 않습니다.';
      status = 404;
    }

    return res.status(status).json({errorMessage});
  }

});

async function getMiddleDuration(getSignedURL) {
  const {stdout} = await exec(`/opt/homebrew/bin/ffprobe -i '${getSignedURL}' -show_entries format=duration -v quiet | grep duration`);
  return Math.floor(Number(stdout.replace('duration=', ''))) / 2;
}

module.exports = router;
