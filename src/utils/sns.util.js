const AWS = require('aws-sdk')
const appConfig = require('../configs/app.config')

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
})

const sns = new AWS.SNS({
  region: appConfig.AWS_REGION || 'us-east-1',
})

// TODO: modularize
const publishSNSMessage = async (message) => {
  const params = {
    Message: JSON.stringify(message),
    TopicArn: 'arn:aws:sns:us-east-1:235271618064:verify_email',
  }
  try {
    const messageData = await sns.publish(params).promise()
    logger.info(
      `Message ${params.Message} sent to the topic ${params.TopicArn} with id ${messageData.MessageId}`
    )
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = {
  publishSNSMessage,
}
