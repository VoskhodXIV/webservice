const express = require('express')
const logger = require('morgan')
const helmet = require('helmet')

const app = express()

const healthz = require('./src/routes/health.route')

app.use(logger('common'))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json())

app.use('/', healthz)

const PORT = 1337

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

module.exports = app
