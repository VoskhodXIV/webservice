const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

const dynamoDatabase = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION || 'us-east-1',
})

const addToken = async (username) => {
  const token = uuidv4()
  const epochTime = new Date().getTime() / 1000 + 300

  const parameter = {
    TableName: 'csye-6225',
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
  await dynamoDatabase.putItem(parameter).promise()
}

const verifyToken = async (email, token) => {
  const params = {
    TableName: 'csye-6225',
    Key: {
      Email: {
        S: email,
      },
    },
  }
  const data = await dynamoDatabase.getItem(params).promise()
  if (data.Item && data.Item.Token && data.Item.TimeToLive) {
    const token = data.Item.Token.S
    const ttl = data.Item.TimeToLive.N
    const curr = new Date().getTime() / 1000
    if (
      data.Item.Email.S === user.dataValues.username &&
      data.Item.Token.S === req.query.token &&
      curr < ttl
    )
      return true
  }
  return false
}

module.exports = {
  addToken,
  verifyToken,
}
