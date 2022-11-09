require('dotenv').config()

module.exports = {
  HOSTNAME: process.env.HOSTNAME,
  USER: process.env.DBUSER,
  PASSWORD: process.env.DBPASSWORD,
  PORT: process.env.PORT,
  DB: process.env.DATABASE,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  METRICS_HOSTNAME: 'localhost',
  METRICS_PORT: 8125,
}
