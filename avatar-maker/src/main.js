require('dotenv').config()
const path = require('path')
const { Client } = require('minio')

const SVGComposer = require('./infrastructure/services/SVGComposer')
const ImageRenderer = require('./infrastructure/services/ImageRenderer')
const ImageUploader = require('./infrastructure/services/ImageUploader')
const AvatarCreator = require('./application/AvatarCreator')
const RabbitConsumer = require('./infrastructure/consumers/RabbitConsumer')

const assetPath = path.join(__dirname, '..', 'assets')

const svgComposer = new SVGComposer(assetPath)
const imageRenderer = new ImageRenderer()

const minio = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: process.env.MINIO_PORT,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})

const uploader = new ImageUploader(minio, 'avatar')
const creator = new AvatarCreator(svgComposer, imageRenderer, uploader)
const consumer = new RabbitConsumer(creator, 'avatar.creation.requested')

consumer.start()
