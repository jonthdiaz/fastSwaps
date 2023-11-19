const express = require('express')
const router = express.Router()
const controller = require('../controllers')

router.post('/transaction', controller.create_transaction)
router.post('/transaction/status', controller.status_transaction)
router.get('/prices', controller.prices)

module.exports = router
