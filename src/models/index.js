const Sequelize = require('sequelize')

const dbConfig = require('../configs/app.config')

// https://github.com/sequelize/sequelize/issues/10015
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOSTNAME,
  port: 5432,
  dialect: 'postgres',
  dialectOptions: dbConfig.dialectOptions,
  logging: false,
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require('./user.model')(sequelize, Sequelize)
db.document = require('./doc.model')(sequelize, Sequelize)

db.connectionTest = async (req, res) => {
  try {
    await sequelize.authenticate()
    console.log(`Successfully connected to database "${dbConfig.DB}"`)
  } catch (error) {
    console.error(`Unable to connect to the database "${dbConfig.DB}":`, error)
  }
}

module.exports = db
