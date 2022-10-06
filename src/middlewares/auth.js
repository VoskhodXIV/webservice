const bcrypt = require('bcrypt')

const db = require('../models/index')

const User = db.users

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    const err = new Error('Not Authenticated!')
    res.setHeader('WWW-Authenticate', 'Basic')
    err.status = 401
    err.message = 'User is not authenticated!'
    res.status(401).send(err.message)
  }

  const auth = new Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':')
  const username = auth[0]
  const password = auth[1]

  User.findOne({
    where: {
      username,
    },
  }).then((result) => {
    const verify = bcrypt.compareSync(password, result.password)
    console.log(`Verified User: ${verify}`)

    if (!verify) {
      const err = new Error('Not Authenticated!')
      res.setHeader('WWW-Authenticate', 'Basic')
      err.status = 401
      err.message = 'User is not authenticated!'
      res.status(401).send(err.message)
    } else if (req.method === 'GET') {
      global.username = result.username
      next()
    } else if (req.method === 'POST') {
      global.username = result.username
      next()
    } else if (req.method === 'DELETE') {
      global.username = result.username
      next()
    } else if (req.method === 'PUT') {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          res.status(400).send()
        } else {
          const { id } = result
          if (req.body.username) {
            res.status(400).send()
            return
          }
          if (req.body.account_created) {
            res.status(400).send()
            return
          }
          if (req.body.account_updated) {
            res.status(400).send()
            return
          }
          const updateUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: hash,
          }
          console.log('Update User Data', updateUser)
          User.update(updateUser, {
            where: {
              id: result.id,
            },
          })
            .then((data) => {
              res.status(204).send()
            })
            .catch((err) => {
              res.status(400).send({ message: 'User Data Error' })
            })
        }
      })
    }
  })
}
