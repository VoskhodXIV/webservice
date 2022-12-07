const express = require('express')
const multer = require('multer')
const logger = require('../configs/logger.config')
const db = require('../models/index')

const User = db.users

const router = express.Router()
const MAX_SIZE = 100 * 1024 * 1024

const {
  uploadDoc,
  listDocs,
  getDocumentDetails,
  deleteDoc,
} = require('../controllers/doc.controller')
const { storage } = require('../utils/s3.util')
const authorizeToken = require('../middlewares/auth')(User, logger)

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE, files: 1 },
})
router.post(
  '/v2/documents/',
  authorizeToken,
  upload.array('document'),
  uploadDoc
)
router.get('/v2/documents/', authorizeToken, listDocs)
router.get('/v2/documents/:doc_id', authorizeToken, getDocumentDetails)
router.delete('/v2/documents/:doc_id', authorizeToken, deleteDoc)

module.exports = router
