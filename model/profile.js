module.exports = (sequelize, DataTypes) => {
  return sequelize.define('profile',
      {
        code: { // 열 이름
          type: DataTypes.INTEGER, // 자료형
          primaryKey: true, // Primary Key 여부
          autoIncrement: true, // 자동증가 여부
        },
        name: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        companyCode: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        type: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        videoCodec: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        videoFormat: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        videoBitrate: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        frameRate: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        resolution: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        profileLevel: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        audioCodec: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        audioBitrate: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        audioSampleRate: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        previewUse: {
          type: DataTypes.BOOLEAN, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        firstTranscode: {
          type: DataTypes.BOOLEAN, // TINYINT -> BOOLEAN
          allowNull: false,
        },
        data: {
          type: DataTypes.JSON, // TEXT = TEXT
          allowNull: false,
        },
        created: {
          type: DataTypes.JSON, // VARCHAR -> STRING
        },
        updated: {
          type: DataTypes.JSON, // VARCHAR -> STRING
        },
        profileUse: {
          type: DataTypes.BOOLEAN, // TINYINT -> BOOLEAN
          allowNull: false,
        },
        overlayUse: {
          type: DataTypes.BOOLEAN, // TINYINT -> BOOLEAN
          allowNull: false,
        },
        editUse: {
          type: DataTypes.BOOLEAN, // TINYINT -> BOOLEAN
          allowNull: false,
        },
        waveform: {
          type: DataTypes.BOOLEAN, // TINYINT -> BOOLEAN
          allowNull: false,
        },
      },
      {
        timestamps: false, // true 시 시퀄라이즈는 자동으로 createdAt과 updateAt 컬럼 추가
        tableName: 'profile',
      });
};
