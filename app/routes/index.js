const express = require('express')
const router = express.Router()
const controller = require('../controllers')

router.post('/transaction', controller.create_transaction)
router.get('/transaction/status/:address', controller.status_transaction)
router.get('/prices', controller.prices)

module.exports = router
