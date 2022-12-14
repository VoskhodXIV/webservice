require('dotenv').config()
const express = require('express')
const helmet = require('helmet')

const { ENVIRONMENT, PORT, HOSTNAME } = process.env
const app = express()

const {
  userRoutes,
  health,
  documentRoute,
} = require('./src/routes/index.routes')
const db = require('./src/models')
const logger = require('./src/configs/logger.config')

app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json())

app.use('/', health, userRoutes, documentRoute)

if (ENVIRONMENT !== 'test') {
  db.connectionTest()
  db.sequelize.sync()
}
app.listen(PORT, () => {
  if (ENVIRONMENT !== 'prod')
    logger.info(`Server running at http://${HOSTNAME}:${PORT}`)
})

module.exports = app
