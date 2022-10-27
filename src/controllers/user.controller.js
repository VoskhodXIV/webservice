const bcrypt = require('bcrypt')
const SDCClient = require('statsd-client')

const db = require('../models/index')
const dbConfig = require('../configs/db.config')

const User = db.users
const sdcclient = new SDCClient({
  host: dbConfig.HOSTNAME,
  port: dbConfig.PORT,
})

exports.createUser = (req, res) => {
  // Validate request
  sdcclient.increment('Creating user')
  const startTime = new Date()

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
  const endTime = new Date()
  sdcclient.timing('User creation time', endTime - startTime)
}

exports.updateUserData = (req, res) => {
  sdcclient.increment('Updating User')
  const startTime = new Date()
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
          message: 'account_Created cannot be updated',
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
            res.status(400).send({
              message: `Cannot update user with id=${id}. Request body is empty or user was not found!`,
            })
          }
        })
        .catch((err) => {
          res.status(500).send({
            message: `Error updating user with id=${id}`,
          })
        })
    }
  })
  const endTime = new Date()
  sdcclient.timing('User update time', endTime - startTime)
}

exports.fetchUserData = async (req, res) => {
  sdcclient.increment('Fetching user data')
  const startTime = new Date()
  const result = await User.findOne({
    where: {
      username: global.username,
    },
  })
  const endTime = new Date()
  sdcclient.timing('Get user data time', endTime - startTime)
  res.status(200).send({
    id: result.id,
    first_name: result.first_name,
    last_name: result.last_name,
    username: result.username,
    account_created: result.account_created,
    account_updated: result.account_updated,
  })
}
