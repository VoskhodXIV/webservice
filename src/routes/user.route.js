const express = require('express')

const router = express.Router()
const {
  fetchUserData,
  createUser,
  updateUserData,
} = require('../controllers/user.controller')
const auth = require('../middlewares/auth')

router.post('/v1/account/', createUser)
router.get('/v1/account/:id', auth, fetchUserData)
router.put('/v1/account/:id', auth, updateUserData)

module.exports = router
