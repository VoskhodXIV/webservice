require('dotenv').config()

module.exports = {
  HOSTNAME: process.env.HOSTNAME,
  USER: process.env.DBUSER,
  PASSWORD: process.env.DBPASSWORD,
  PORT: process.env.PORT,
  DB: process.env.DATABASE,
  timezone: '-05:00',
}
