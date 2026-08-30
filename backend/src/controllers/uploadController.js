/** POST /uploads/image */
const config = require('../config/env')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const image = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('파일을 선택해 주세요.')

  res.status(201).json({
    url: config.upload.publicPath + '/' + req.file.filename,
    name: req.file.originalname,
    size: req.file.size,
  })
})

module.exports = { image }
