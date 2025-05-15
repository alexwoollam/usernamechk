import express from 'express'
import logger from './services/logger.js'
import eventRoutes from './routes/index.js'
import { cacheMiddleware } from './middleware/cache.js'
import { initDb } from './services/dbConnection.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cacheMiddleware(60))

app.use(eventRoutes)

app.use((req, res) => {
  logger.error(`404 Not Found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ error: 'Not Found' })
})

app.use(errorHandler)

await initDb()

app.listen(port, () => {
  logger.info(`API Gateway listening on port ${port}`)
})
