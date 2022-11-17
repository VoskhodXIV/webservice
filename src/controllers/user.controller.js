const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const statsd = require('node-statsd')
const AWS = require('aws-sdk')
const logger = require('../configs/logger.config')
const db = require('../models/index')
const appConfig = require('../configs/app.config')
const { hashPassword } = require('../utils/auth.util')

const User = db.users
const client = new statsd({
  host: appConfig.METRICS_HOSTNAME,
  port: appConfig.METRICS_PORT,
})

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
})
const sns = new AWS.SNS({})
const dynamoDatabase = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION || 'us-east-1',
})

const formatUser = (user) => {
  const {
    id,
    first_name,
    last_name,
    username,
    account_created,
    account_updated,
  } = user
  const data = {
    id,
    first_name,
    last_name,
    username,
    account_created,
    account_updated,
  }
  return data
}

const createUser = async (req, res) => {
  client.increment('endpoint.create.user')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })
  const hash = await bcrypt.hash(req.body.password, 10)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRegex.test(req.body.username)) {
    logger.warn(`Invalid e-mail format`)
    res.status(400).send({
      message: 'Enter your Email ID in correct format. Example: abc@xyz.com',
    })
  }
  const getUser = await User.findOne({
    where: {
      username: req.body.username,
    },
  }).catch((err) => {
    logger.error('Internal server error while creating user')
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the user',
    })
  })
  if (getUser) {
    res.status(400).send({
      message: 'User already exists!',
    })
  } else {
    const user = {
      id: uuidv4(),
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password: hash,
      username: req.body.username,
      verified: false,
    }

    User.create(user)
      .then(async (data) => {
        const randomnanoID = uuidv4()

        const epochTime = new Date().getTime() / 1000 + 300
        const parameter = {
          TableName: 'csye-6225',
          Item: {
            Email: {
              S: data.username,
            },
            Token: {
              S: randomnanoID,
            },
            TimeToLive: {
              N: epochTime.toString(),
            },
          },
        }
        try {
          const dydb = await dynamoDatabase.putItem(parameter).promise()
          logger.info('dynamoDatabase putItem() success:', dydb)
        } catch (err) {
          logger.error('dynamoDatabase has an error:', err)
        }
        const msg = {
          username: data.username,
          token: randomnanoID,
        }
        logger.info('User token info:', { msg })
        const params = {
          Message: JSON.stringify(msg),
          Subject: randomnanoID,
          TopicArn: 'arn:aws:sns:us-east-1:235271618064:verify_email',
        }
        const publishTextPromise = await sns.publish(params).promise()
        console.log('publishTextPromise', publishTextPromise)
        logger.info('Successfully created user')
        res.status(201).send({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
          verified: data.verified,
          account_created: data.account_created,
          account_updated: data.account_updated,
        })
      })
      .catch((err) => {
        logger.error(
          'Internal server error occurred while creating the user',
          err
        )
        res.status(500).send({
          message:
            err.message || 'Some error occurred while creating the user!',
        })
      })
  }
}

const updateUserData = async (req, res) => {
  client.increment('endpoint.update.user')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })

  const { user } = req
  if (
    req.body.id ||
    req.body.username !== user.username ||
    req.body.account_updated ||
    req.body.account_created
  ) {
    logger.warn('Invalid request body for user object')
    return res.status(400).json({
      message:
        'id, username, account_created, and account_updated cannot be set',
    })
  }

  if (!(req.body.password || req.body.first_name || req.body.last_name)) {
    logger.warn('Invalid request body for user object')
    return res.status(400).json({
      message: 'password, first_name, or last_name are required',
    })
  }

  logger.info(`Updating user ${user.username}`)
  user.set({
    first_name: req.body.first_name || user.first_name,
    last_name: req.body.last_name || user.last_name,
    password: req.body.password
      ? await hashPassword(req.body.password)
      : user.password,
    account_updated: new Date(),
  })

  try {
    logger.info(`Updating and Storing user ${user.username} in db`)
    await user.save()
    res.status(204).send()
  } catch (err) {
    logger.error('Internal server error', err)
    return res.status(500).json({ message: 'Internal server error', err })
  }
}

const fetchUserData = async (req, res) => {
  try {
    client.increment('endpoint.fetch.user')
    const { protocol, method, hostname, originalUrl } = req
    const headers = { ...req.headers }
    const metaData = { protocol, method, hostname, originalUrl, headers }
    logger.info(
      `Requesting ${method} ${protocol}://${hostname}${originalUrl}`,
      {
        metaData,
      }
    )
    const validUserID =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
        req.params.id
      )
    if (!validUserID)
      return res.status(403).send({ message: 'check the user ID' })
    const user = await User.findByPk(req.params.id)
    if (user === null) return res.status(404).send({ message: 'Not Found!' })
    const data = formatUser(user)
    if (req.params.id === data.id && user.username === req.user.username) {
      return res.status(200).json(data)
    }
    return res.status(401).send({ message: 'Unauthorized user' })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ message: 'Internal server error', err })
  }
}

const verifyUser = async (req, res) => {
  const user = await User.findOne({
    where: {
      username: req.query.email,
    },
  })
  if (user) {
    if (user.dataValues.verified) {
      res.status(202).send({
        message: 'Already Successfully Verified!',
      })
    } else {
      const params = {
        TableName: 'csye-6225',
        Key: {
          Email: {
            S: req.query.email,
          },
          Token: {
            S: req.query.token,
          },
        },
      }
      // Call DynamoDB to read the item from the table
      dynamoDatabase.getItem(params, (err, data) => {
        if (err) {
          logger.error('Cannot get items from dynamoDB', err)
          res.status(400).send({
            message: 'unable to verify',
          })
        } else {
          logger.info('Success dynamoDatabase getItem()', data.Item)
          try {
            const ttl = data.Item.TimeToLive.N
            const curr = new Date().getTime() / 1000
            logger.info('Epoch and Current time', { ttl, curr })
            if (curr < ttl) {
              if (
                data.Item.Email.S === user.dataValues.username &&
                data.Item.Token.S === req.query.token
              ) {
                const userUpdate = {
                  verified: true,
                  account_updated: new Date(),
                }
                User.update(userUpdate, {
                  where: {
                    username: req.query.email,
                  },
                })
                  .then((result) => {
                    client.increment('endpoint.update.user')
                    res.status(200).send({
                      message: 'Successfully Verified!',
                    })
                  })
                  .catch((err) => {
                    res.status(500).send({
                      message: 'Error Updating the user',
                      err,
                    })
                  })
              } else {
                res.status(400).send({
                  message: 'Token and email did not match',
                })
              }
            } else {
              res.status(400).send({
                message: 'Token expired! Cannot verify email',
              })
            }
          } catch (err) {
            logger.error('Some error occurred', err)
            res.status(400).send({
              message: 'Unable to verify',
            })
          }
        }
      })
    }
  } else {
    res.status(400).send({
      message: 'User not found!',
    })
  }
}
module.exports = {
  createUser,
  updateUserData,
  fetchUserData,
  verifyUser,
}
