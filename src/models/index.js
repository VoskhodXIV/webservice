const Sequelize = require('sequelize')

const dbConfig = require('../configs/db.config')

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: 5432,
  dialect: dbConfig.dialect,
  operatorAliases: false,
  logging: false,
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require('./user.model')(sequelize, Sequelize)

db.connectionTest = async (req, res) => {
  try {
    await sequelize.authenticate()
    console.log(`Successfully connected to database "${dbConfig.DB}"`)
  } catch (error) {
    console.error(`No connection to the database "${dbConfig.DB}"`)
  }
}

module.exports = db
