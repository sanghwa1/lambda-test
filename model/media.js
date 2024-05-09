module.exports = (sequelize, DataTypes) => {
  return sequelize.define('media',
      {
        code: { // 열 이름
          type: DataTypes.STRING, // 자료형
          primaryKey: true, // Primary Key 여부
        },
        title: {
          type: DataTypes.STRING,
        },
        companyCode: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        transcodingJob: {
          type: DataTypes.JSON,
        },
        transcodingJobID: {
          type: DataTypes.STRING,
        },
        category: {
          type: DataTypes.JSON,
        },
        duration: {
          type: DataTypes.INTEGER,
        },
        origin: {
          type: DataTypes.JSON,
        },
        thumbnail: {
          type: DataTypes.JSON,
        },
        transcoding: {
          type: DataTypes.JSON,
        },
        hls: {
          type: DataTypes.JSON,
        },
        mediaKey: {
          type: DataTypes.STRING,
        },
        transcodingStatus: {
          type: DataTypes.STRING,
        },
        transcodingProgress: {
          type: DataTypes.STRING,
        },
        transcodingResponse: {
          type: DataTypes.JSON,
        },
        social: {
          type: DataTypes.JSON,
        },
        deleteStatus: {
          type: DataTypes.BOOLEAN,
        },
        physicalDeleteStatus: {
          type: DataTypes.BOOLEAN,
        },
        metaStatus: {
          type: DataTypes.BOOLEAN,
        },
        metaCode: {
          type: DataTypes.STRING,
        },
        sttStatus: {
          type: DataTypes.STRING,
        },
        sttLanguage: {
          type: DataTypes.STRING,
        },
        sttJob: {
          type: DataTypes.JSON,
        },
        sttData: {
          type: DataTypes.JSON,
        },
        timeLine: {
          type: DataTypes.JSON,
        },
        archiveStatus: {
          type: DataTypes.STRING, // VARCHAR -> STRING
        },
        archiveDate: {
          type: 'TIMESTAMP',
        },
        restoredExpireDate: {
          type: 'TIMESTAMP',
        },
        createDate: {
          type: 'TIMESTAMP',
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false, // NOT NULL -> allowNull
        },
        updateDate: {
          type: 'TIMESTAMP',
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false, // NOT NULL -> allowNull
        },
        expectedDeleteDate: {
          type: 'TIMESTAMP',
        },
        created: {
          type: DataTypes.JSON, // VARCHAR -> STRING
        },
        updated: {
          type: DataTypes.JSON, // VARCHAR -> STRING
        },
      },
      {
        timestamps: false, // true 시 시퀄라이즈는 자동으로 createdAt과 updateAt 컬럼 추가
        tableName: 'media',
      });
};
