require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const helmet = require('helmet')

const { ENVIRONMENT, PORT, HOSTNAME } = process.env
const app = express()

const { userRoutes, healthz } = require('./src/routes/index.routes')
const db = require('./src/models')

app.use(logger('common'))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json())

app.use('/', healthz)
app.use('/', userRoutes)

if (ENVIRONMENT === 'dev') {
  db.connectionTest()
  db.sequelize.sync()
} else if (ENVIRONMENT === 'prod') {
  db.sequelize.sync()
}

app.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}`)
})

module.exports = app
