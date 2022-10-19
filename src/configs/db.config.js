module.exports = {
  HOST: process.env.DBHOST,
  USER: process.env.DBUSER,
  PASSWORD: process.env.DBPASSWORD,
  DB: process.env.DATABASE,
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 20000,
  },
  dialectOptions: {
    useUTC: false,
    dateStrings: true,
    typeCast: true,
  },
  timezone: '-05:00',
}
