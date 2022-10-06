const express = require('express')

const router = express.Router()

router.get('/healthz', (req, res) => {
  try {
    res.sendStatus(200).json()
  } catch (err) {
    res.sendStatus(404).json({ message: '404 not found' })
  }
})

module.exports = router
