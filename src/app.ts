import express from 'express'
import logger from 'morgan'
import helmet from 'helmet'
import cors from 'cors'

import 'dotenv/config'
import { PROD } from './constants'

import routes from './routes'

import { errorHandler } from './middlewares/errorHandler'
import { notFound } from './middlewares/notFound'

const app = express()

// https://www.npmjs.com/package/morgan
// https://www.digitalocean.com/community/tutorials/nodejs-getting-started-morgan
app.use(logger('common'))
// https://www.securecoding.com/blog/using-helmetjs/
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json())

// https://expressjs.com/en/resources/middleware/cors.html
if (!PROD) {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
    })
  )
}

app.use('/', routes)

// error middlewares
app.use(notFound)
app.use(errorHandler)

export default app
