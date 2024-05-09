module.exports = (sequelize, DataTypes) => {
  return sequelize.define('company',
      {
        code: { // 열 이름
          type: DataTypes.STRING, // 자료형
          primaryKey: true, // Primary Key 여부
        },
        name: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING, // VARCHAR -> STRING
          allowNull: false, // NOT NULL -> allowNull
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
        config: {
          type: DataTypes.JSON, // VARCHAR -> STRING
          allowNull: false, // NOT NULL -> allowNull
        },
        created: {
          type: DataTypes.JSON, // VARCHAR -> STRING
        },
        updated: {
          type: DataTypes.JSON, // VARCHAR -> STRING
        },
        deleted: {
          type: DataTypes.JSON, // VARCHAR -> STRING
        },
      },
      {
        timestamps: false, // true 시 시퀄라이즈는 자동으로 createdAt과 updateAt 컬럼 추가
        tableName: 'company',
      });
};
