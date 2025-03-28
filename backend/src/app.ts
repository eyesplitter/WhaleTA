import express from "express"
import dotenv from "dotenv"
import { Pool } from "pg"
import { PriceRepository } from "./repositories/PriceRepository"
import { RedisRepository } from "./repositories/RedisRepository"
import { HistoricPriceRepository } from "./repositories/HistoricPriceRepository"
import { PriceManager } from "./managers/PriceManager"
import { PriceController } from "./controllers/PriceController"
import cors from "cors"
dotenv.config()

const config: Record<string, string | number> = {
  port: parseInt(process.env.SERVER_PORT) || 5005,
  pgHost: process.env.MYSQL_HOST || "localhost",
  pgPort: parseInt(process.env.MYSQL_PORT) || 5432,
  pgUser: process.env.MYSQL_USER || "postgres",
  pgPassword: process.env.MYSQL_PASSWORD || "cryptoexchangepass",
  pgDatabase: process.env.MYSQL_DATABASE || "cryptoexchange",
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: parseInt(process.env.REDIS_PORT) || 6379,
  redisPassword: process.env.REDIS_PASSWORD || "cryptoexchangepass",
}

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const redisUrl = `redis://${config.redisHost}:${config.redisPort}${config.redisPassword ? `?password=${config.redisPassword}` : ""}`
const redisRepository = new RedisRepository(redisUrl)
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
