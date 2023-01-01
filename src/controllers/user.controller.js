const { v4: uuidv4 } = require('uuid')
const statsd = require('node-statsd')
const db = require('../models/index')
const logger = require('../configs/logger.config')
const appConfig = require('../configs/app.config')
const { hashPassword } = require('../utils/auth.util')
const { addToken, verifyToken } = require('../utils/dynamo.util')
const { publishSNSMessage } = require('../utils/sns.util')

const User = db.users
const client = new statsd({
  host: appConfig.METRICS_HOSTNAME,
  port: appConfig.METRICS_PORT,
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
  logger.info(
    `Hashing password for user ${req.body.first_name} ${req.body.last_name}`
  )
  const hash = await hashPassword(req.body.password)
  // Email regex format validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRegex.test(req.body.username)) {
    logger.warn(`Invalid e-mail format`)
    res.status(400).send({
      message: 'Enter your Email ID in correct format. Example: abc@xyz.com',
    })
  }
  // Validation for ID, account_created, account_updated fields
  logger.info(`Validating request body for user object`)
  if (req.body.id || req.body.account_created || req.body.account_updated) {
    const message =
      'id, account_created and account_updated fields cannot be sent in the request body'
    logger.warn(`Invalid request body for user object`, { message })
    return res.status(400).json({ message })
  }
  // Null check validation for username, password, first_name, last_name fields
  if (
    !req.body.username ||
    !req.body.password ||
    !req.body.first_name ||
    !req.body.last_name
  ) {
    const message =
      'username, password, first_name, last_name fields are required in the request body'
    logger.warn(`Invalid request body for user object`, { message })
    return res.status(400).json({ message })
  }
  // Create the new user
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
    const user = User.build({
      id: uuidv4(),
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password: hash,
      username: req.body.username,
      verified: false,
      account_created: new Date(),
      account_updated: new Date(),
    })

    try {
      // Adding user access token to the DynamoDB
      logger.info(`Adding user ${req.body.username} to dynamoDB`)
      const token = await addToken(user.username)

      // Send message to Amazon SNS
      logger.info(`Sending message to Amazon SNS`)
      const message = {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        token,
      }
      await publishSNSMessage(message)

      // Storing the user in the database
      logger.info(`Storing user-data in the database`)
      const data = await user.save()
      const formattedData = formatUser(data.dataValues)
      return res.status(201).json(formattedData)
    } catch (err) {
      // If username already exists, return a 400 error
      if (err.name === 'SequelizeUniqueConstraintError') {
        logger.error(`User ${req.body.username} already exists`)
        return res.status(400).json({ message: 'Username already exists' })
      }
      if (err.name === 'SequelizeValidationError') {
        logger.error('Invalid request body for user object')
        return res.status(400).json({
          message:
            'Invalid username, Username should be an email Ex: abc@domain.com',
        })
      }
      logger.error(err)
      return res.status(500).json({ message: 'Internal server error' })
    }
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
  client.increment('endpoint.verify.user')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })

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
      // verify email and token
      try {
        const isValid = await verifyToken(req.query.email, req.query.token)
        if (isValid) {
          logger.info(
            `User email and token matched! Updating user details in database`
          )
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
          logger.error(`User email is invalid OR the token has expired!`)
          res.status(400).send({
            message: 'Email or token is invalid',
          })
        }
      } catch (err) {
        logger.error(`unable to verify user, internal error occurred bro`)
        res.status(500).send({
          message: 'Internal server error',
          err,
        })
      }
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
