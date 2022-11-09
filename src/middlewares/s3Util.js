require('dotenv').config()
const multer = require('multer')
const { S3 } = require('aws-sdk')
const db = require('../models')

const User = db.users

/**
 * Multer memory storage
 */
const storage = multer.memoryStorage()

/**
 * Document upload function: Helper function to upload a file to the AWS S3 bucket
 * @param {*} files an array of files, but the we will limit the number of files to 1
 * @returns the metadata of the S3 object to be stored in AWS RDS instance
 */
const s3Uploadv2 = async (files) => {
  const s3 = new S3()
  const userData = await User.findOne({
    where: {
      username: global.username,
    },
  })
  const { id } = userData
  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${id}/${file.originalname}`,
      Body: file.buffer,
    }
  })

  const res = await Promise.all(
    params.map((param) => s3.upload(param).promise())
  )
  return res
}

const s3Deletev2 = async (fileName) => {
  const s3 = new S3()
  const userData = await User.findOne({
    where: {
      username: global.username,
    },
  })
  const { id } = userData
  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${id}/${fileName}`,
  }
  const res = await s3.deleteObject(param).promise()
  return res
}

module.exports = {
  storage,
  s3Uploadv2,
  s3Deletev2,
}
