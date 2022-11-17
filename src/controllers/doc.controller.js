const { v4: uuidv4 } = require('uuid')

const statsd = require('node-statsd')
const appConfig = require('../configs/app.config')
const { s3Uploadv2, s3Deletev2 } = require('../utils/s3.util')
const db = require('../models')
const logger = require('../configs/logger.config')

const User = db.users
const Document = db.document

const client = new statsd({
  host: appConfig.METRICS_HOSTNAME,
  port: appConfig.METRICS_PORT,
})

const uploadDoc = async (req, res) => {
  client.increment('endpoint.upload.documents')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })
  try {
    const userData = await User.findOne({
      where: {
        username: global.username,
      },
    })
    const { id } = userData
    if (req.files.length === 0)
      return res.status(400).send({ message: 'check the file to upload!' })
    const file = req.files[0].originalname
    const exists = await Document.findOne({
      where: {
        name: file,
        user_id: id,
      },
    })
    if (exists) {
      return res.status(400).send({ message: 'file already exists!' })
    }
    const results = await s3Uploadv2(req.files)
    if (results.length === 0) {
      logger.warn(
        `Bad Request ${method} ${protocol}://${hostname}${originalUrl}`,
        {
          metaData,
        }
      )
      return res.status(400).send({ message: 'check the file to upload!' })
    }
    const documents = results.map((result) => {
      return Document.build({
        doc_id: uuidv4(),
        user_id: id,
        name: result.Key.split('/')[1],
        date_created: new Date(),
        s3_bucket_path: result.Location,
      })
    })
    try {
      await documents.map((document) => document.save())
    } catch (err) {
      return res.status(500).send({ message: 'Internal server error' })
    }
    return res.status(201).json(documents)
  } catch (err) {
    logger.warn(
      `Bad Request ${method} ${protocol}://${hostname}${originalUrl}`,
      err
    )
    return res
      .status(400)
      .send({ message: 'Bad Request, check the file to upload!', err })
  }
}

const listDocs = async (req, res) => {
  client.increment('endpoint.fetch.documents')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })
  try {
    const userData = await User.findOne({
      where: {
        username: req.user.username,
      },
    })
    const { id } = userData
    const documents = await Document.findAll({
      where: {
        user_id: id,
      },
    })
    if (documents.length === 0) return res.status(200).send(documents)
    const result = documents.map((document) => {
      return {
        doc_id: document.doc_id,
        user_id: document.user_id,
        name: document.name,
        date_created: document.date_created,
        s3_bucket_path: document.s3_bucket_path,
      }
    })
    return res.status(201).json(result)
  } catch (err) {
    logger.warn(
      `Bad Request ${method} ${protocol}://${hostname}${originalUrl}`,
      {
        metaData,
      }
    )
    return res.status(400).send({ message: 'Bad Request' })
  }
}

const getDocumentDetails = async (req, res) => {
  client.increment('endpoint.describe.document')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })
  try {
    const userData = await User.findOne({
      where: {
        username: req.user.username,
      },
    })
    const { id } = userData
    const { doc_id } = req.params
    const validDocID =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
        doc_id
      )
    if (!validDocID)
      return res.status(403).send({ message: 'check the document ID' })
    const document = await Document.findByPk(doc_id)
    if (document === null) return res.status(200).send(document)
    const { user_id } = document
    if (id === user_id) return res.status(200).send(document)
    return res.status(401).send({ message: 'Unauthorized' })
  } catch (err) {
    logger.warn(
      `Bad Request ${method} ${protocol}://${hostname}${originalUrl}`,
      {
        metaData,
      }
    )
    return res.status(400).send({ message: 'Bad Request' })
  }
}

const deleteDoc = async (req, res) => {
  client.increment('endpoint.delete.document')
  const { protocol, method, hostname, originalUrl } = req
  const headers = { ...req.headers }
  const metaData = { protocol, method, hostname, originalUrl, headers }
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, {
    metaData,
  })
  try {
    const userData = await User.findOne({
      where: {
        username: global.username,
      },
    })
    const { id } = userData
    const { doc_id } = req.params
    const validDocID =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
        doc_id
      )
    if (!validDocID)
      return res.status(403).send({ message: 'check the document ID' })
    const document = await Document.findByPk(doc_id)
    if (document === null)
      return res.status(404).send({ message: 'Not Found!' })
    const { name, user_id } = document
    try {
      if (id === user_id) {
        await s3Deletev2(name)
        await document.destroy()
      } else {
        return res.status(401).send({ message: 'Unauthorized!' })
      }
    } catch (err) {
      return res.status(500).send({ message: 'Internal server error!' })
    }
    return res.status(204).send()
  } catch (err) {
    logger.warn(
      `Bad Request ${method} ${protocol}://${hostname}${originalUrl}`,
      {
        metaData,
      }
    )
    return res.status(400).send({ message: 'Bad Request!' })
  }
}
module.exports = {
  uploadDoc,
  listDocs,
  getDocumentDetails,
  deleteDoc,
}
