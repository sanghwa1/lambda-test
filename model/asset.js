module.exports = (sequelize, DataTypes) => {
  return sequelize.define('asset',
      {
        code: { // 열 이름
          type: DataTypes.INTEGER, // 자료형
          primaryKey: true, // Primary Key 여부
          autoIncrement: true, // 자동증가 여부
        },
        mediaCode: { // 열 이름
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        type: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        bucket: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        key: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        fileName: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        extension: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        s3Url: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        httpUrl: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        cdnUrl: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        position: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        width: {
          type: DataTypes.INTEGER, // 자료형
          allowNull: true, // NOT NULL -> allowNull
        },
        height: {
          type: DataTypes.INTEGER, // 자료형
          allowNull: true, // NOT NULL -> allowNull
        },
        fileSize: {
          type: DataTypes.INTEGER, // 자료형
          allowNull: true, // NOT NULL -> allowNull
        },
        index: {
          type: DataTypes.INTEGER, // 자료형
          allowNull: true, // NOT NULL -> allowNull
        },
        created: {
          type: DataTypes.JSON, // VARCHAR -> STRING
          allowNull: true, // NOT NULL -> allowNull
        },
        default: {
          type: DataTypes.BOOLEAN, // TINYINT -> BOOLEAN
          allowNull: false,
        },
        deleteStatus: {
          type: DataTypes.BOOLEAN, // TINYINT -> BOOLEAN
          allowNull: false,
        },
        archiveStatus: {
          type: DataTypes.STRING, // VARCHAR -> STRING
        },
      },
      {
        timestamps: false, // true 시 시퀄라이즈는 자동으로 createdAt과 updateAt 컬럼 추가
        tableName: 'asset',
      });
};
