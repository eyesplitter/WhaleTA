import express from "express"
import dotenv from "dotenv"
import { Pool } from "pg"
import { PriceRepository } from "./repositories/PriceRepository"
import { RedisRepository } from "./repositories/RedisRepository"
import { HistoricPriceRepository } from "./repositories/HistoricPriceRepository"
import { PriceManager } from "./managers/PriceManager"
import { PriceController } from "./controllers/PriceController"
import cors from "cors"
import { Config } from "./types"
dotenv.config()

const config: Config = {
  port: parseInt(process.env.SERVER_PORT ?? "5005", 10),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
}

if (!config.databaseUrl) {
  console.error("DATABASE_URL is not set in the environment variables.")
  process.exit(1)
}

if (!config.redisUrl) {
  console.error("REDIS_URL is not set in the environment variables.")
  process.exit(1)
}

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: config.databaseUrl,
})
const redisRepository = new RedisRepository(config.redisUrl)
const priceRepository = new PriceRepository(pool)
const historicPriceRepository = new HistoricPriceRepository(pool)
const priceManager = new PriceManager(priceRepository, redisRepository, historicPriceRepository)
const priceController = new PriceController(priceManager)

app.get("/price/:pair", (req, res) => priceController.getPrice(req, res))
app.get("/price/:pair/history", (req, res) => priceController.getHistoricPrices(req, res))
app.get("/health", (req, res) => priceController.healthCheck(req, res))
;(async () => {
  await redisRepository.connect()

  await new Promise<void>((resolve, reject) => {
    app
      .listen(config.port, () => {
        console.info(`HTTP server is listening on ${config.port}`)
        resolve()
      })
      .on("error", (error) => {
        console.error("Could not start http server", { error: error })
        reject(error)
      })
  })
})()
  .then(() => {
    console.info("Backend ready")
  })
  .catch(async (error) => {
    console.error(`Failed to start: ${error.message}`, { error: error })
    await redisRepository.disconnect()
    process.exit(1)
  })

const shutdown = async () => {
  console.info("Shutting down server...")
  await redisRepository.disconnect()
  await pool.end()
  process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
