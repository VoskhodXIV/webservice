require('dotenv').config()

const {
  HOSTNAME,
  DBUSER,
  DBPASSWORD,
  PORT,
  DATABASE,
  AWS_BUCKET_NAME,
  DYNAMO_DB_TABLE_NAME,
  SNS_TOPIC_ARN,
  AWS_REGION,
} = process.env

module.exports = {
  HOSTNAME,
  USER: DBUSER,
  PASSWORD: DBPASSWORD,
  PORT,
  DB: DATABASE,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  METRICS_HOSTNAME: 'localhost',
  METRICS_PORT: 8125,
  AWS_REGION,
  AWS_BUCKET_NAME,
  SNS_TOPIC_ARN,
  DYNAMO_DB_TABLE_NAME,
}
