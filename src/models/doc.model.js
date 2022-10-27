module.exports = (sequelize, Sequelize) => {
  const Document = sequelize.define('document', {
    doc_id: {
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.DataTypes.UUID,
      field: 'user_id',
    },
    name: {
      type: Sequelize.DataTypes.STRING,
      required: true,
      allowNull: false,
    },
    date_created: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    s3_bucket_path: {
      type: Sequelize.DataTypes.STRING,
      required: true,
      allowNull: false,
    },
  })

  Document.associate = (models) => {
    models.Document.belongsTo(models.User, {
      foreignKey: 'id',
      as: 'user',
    })
  }
  return Document
}
