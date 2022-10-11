const express = require('express')
const logger = require('morgan')
const helmet = require('helmet')

const app = express()

const { userRoutes, healthz } = require('./src/routes/index.routes')
const db = require('./src/models')

app.use(logger('common'))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json())

app.use('/', healthz)
app.use('/', userRoutes)

db.connectionTest()
db.sequelize.sync()

const PORT = 1337

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

module.exports = app
