require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const helmet = require('helmet')

const { ENVIRONMENT, PORT, HOSTNAME } = process.env
const app = express()

const {
  userRoutes,
  healthz,
  documentRoute,
} = require('./src/routes/index.routes')
const db = require('./src/models')

app.use(logger('common'))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json())

app.use('/', healthz, userRoutes, documentRoute)

db.sequelize.sync()
app.listen(PORT, () => {
  if (ENVIRONMENT !== 'test')
    console.log(`Server running at http://${HOSTNAME}:${PORT}`)
})

module.exports = app
