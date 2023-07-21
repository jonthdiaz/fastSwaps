const express = require('express')
const router = express.Router()
const controller = require('../controllers')

router.get('/data', controller.get_files)

module.exports = router
