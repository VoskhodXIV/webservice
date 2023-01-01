const { DynamoDB } = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const appConfig = require('../configs/app.config')
const logger = require('../configs/logger.config')

const dynamoDatabase = new DynamoDB({
  apiVersion: '2012-08-10',
  region: appConfig.AWS_REGION || 'us-east-1',
})

const TableName = appConfig.DYNAMO_DB_TABLE_NAME

const addToken = async (username) => {
  const token = uuidv4()
  const epochTime = new Date().getTime() / 1000 + 300

  const parameter = {
    TableName,
    Item: {
      Email: {
        S: username,
      },
      Token: {
        S: token,
      },
      TimeToLive: {
        N: epochTime.toString(),
      },
    },
  }
  try {
    const dynamoDB = await dynamoDatabase.putItem(parameter).promise()
    logger.info(`dynamoDB putItem() success`)
  } catch (err) {
    logger.error(`dynamoDB putItem() error!`, { err })
  }
  return token
}

const verifyToken = async (email, token) => {
  const params = {
    TableName,
    Key: {
      Email: {
        S: email,
      },
      Token: {
        S: token,
      },
    },
  }
  const data = await dynamoDatabase.getItem(params).promise()
  if (data.Item && data.Item.Token && data.Item.TimeToLive) {
    const dbToken = data.Item.Token.S
    const tokenTTL = data.Item.TimeToLive.N
    const currTime = new Date().getTime() / 1000
    if (dbToken === token && currTime < tokenTTL) return true
  }
  return false
}

module.exports = {
  addToken,
  verifyToken,
}
