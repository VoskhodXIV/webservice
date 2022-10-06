const express = require('express')

const router = express.Router()
const {
  fetchUserData,
  createUser,
  updateUserData,
} = require('../controllers/user.controller')
const auth = require('../middlewares/auth')

router.post('/', createUser)
router.get('/:id', auth, fetchUserData)
router.put('/:id', auth, updateUserData)

module.exports = router
