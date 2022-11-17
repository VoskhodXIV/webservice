const express = require('express')
const logger = require('../configs/logger.config')
const db = require('../models/index')

const User = db.users

const router = express.Router()
const {
  fetchUserData,
  createUser,
  updateUserData,
  verifyUser,
} = require('../controllers/user.controller')
const authorizeToken = require('../middlewares/auth')(User, logger)

router.post('/v1/account/', createUser)
router.get('/v1/account/:id', authorizeToken, fetchUserData)
router.put('/v1/account/:id', authorizeToken, updateUserData)
router.get('/v1/verifyUserEmail/', verifyUser)

module.exports = router
