const Sequelize = require('sequelize')

const dbConfig = require('../configs/db.config')

// https://github.com/sequelize/sequelize/issues/10015
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOSTNAME,
  port: 5432,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require('./user.model')(sequelize, Sequelize)
db.document = require('./doc.model')(sequelize, Sequelize)

module.exports = db
