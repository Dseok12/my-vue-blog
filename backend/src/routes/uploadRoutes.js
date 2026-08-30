/** /api/uploads */
const express = require('express')

const uploadController = require('../controllers/uploadController')
const { uploadImage } = require('../middlewares/upload')

const router = express.Router()

router.post('/image', uploadImage, uploadController.image)

module.exports = router
