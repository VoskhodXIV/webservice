const bcrypt = require('bcrypt')
const statsd = require('node-statsd')
const logger = require('../configs/logger.config')
const db = require('../models/index')
const dbConfig = require('../configs/db.config')

const User = db.users
const client = new statsd({
  host: dbConfig.METRICS_HOSTNAME,
  port: dbConfig.METRICS_PORT,
})

const createUser = (req, res) => {
  client.increment('endpoint.create.user')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })
  if (!req.body.first_name) {
    res.status(400).send()
    return
  }
  if (!req.body.last_name) {
    res.status(400).send()
    return
  }
  if (!req.body.username) {
    res.status(400).send()
    return
  }
  if (!req.body.password) {
    res.status(400).send()
    return
  }

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({
        error: err,
        message: 'An error occurred while creating the user',
      })
    } else {
      const userObject = {
        id: req.body.id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: hash,
      }
      User.create(userObject)
        .then((data) => {
          const dataNew = {
            id: data.id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            account_created: data.account_created,
            account_updated: data.account_updated,
          }
          res.status(201).send({ dataNew })
        })
        .catch((err) => {
          res.status(400).send()
        })
    }
  })
}

const updateUserData = (req, res) => {
  client.increment('endpoint.update.user')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      res.status(400).json({
        message: 'Select a user ID to update',
      })
    } else if (req.params.id == null) {
      res.status(400).json({
        message: 'Select a user ID to update',
      })
    } else {
      const { id } = req.params

      if (req.body.username) {
        res.status(400).send({
          message: 'username cannot be updated',
        })
        return
      }
      if (req.body.account_created) {
        res.status(400).send({
          message: 'account_created cannot be updated',
        })
        return
      }
      if (req.body.account_updated) {
        res.status(400).send({
          message: 'account_updated cannot be updated',
        })
        return
      }
      const userUpdate = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        password: hash,
      }
      User.update(userUpdate, {
        where: { id: result.id },
      })
        .then((num) => {
          if (num === 1) {
            res.status(200).send({
              message: 'User was updated successfully!',
            })
          } else {
            logger.warn(
              `Bad Request ${method} ${protocol}://${hostname}${originalUrl}`,
              {
                metaData,
              }
            )
            res.status(400).send({
              message: `Cannot update user with id=${id}. Request body is empty or user was not found!`,
            })
          }
        })
        .catch((err) => {
          logger.warn(
            `Internal Server Error ${method} ${protocol}://${hostname}${originalUrl}`,
            {
              metaData,
            }
          )
          res.status(500).send({
            message: `Error updating user with id=${id}`,
          })
        })
    }
  })
}

const fetchUserData = async (req, res) => {
  client.increment('endpoint.fetch.user')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })
  const result = await User.findOne({
    where: {
      username: global.username,
    },
  })
  if (!result.id)
    logger.warn(
      `User ID not valid ${method} ${protocol}://${hostname}${originalUrl}`,
      {
        metaData,
      }
    )
  res.status(200).send({
    id: result.id,
    first_name: result.first_name,
    last_name: result.last_name,
    username: result.username,
    account_created: result.account_created,
    account_updated: result.account_updated,
  })
}

module.exports = {
  createUser,
  updateUserData,
  fetchUserData,
}
