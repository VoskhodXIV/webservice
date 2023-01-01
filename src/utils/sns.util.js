const { SNS } = require('aws-sdk')
const appConfig = require('../configs/app.config')
const logger = require('../configs/logger.config')

const sns = new SNS({
  region: appConfig.AWS_REGION || 'us-east-1',
})

const TopicArn = appConfig.SNS_TOPIC_ARN

const publishSNSMessage = async (message) => {
  const params = {
    Message: JSON.stringify(message),
    TopicArn,
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
