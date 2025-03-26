import express from "express"
import dotenv from "dotenv"
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

app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "it works" })
})
;(async () => {
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
  .catch((error) => {
    console.error(`Failed to start: ${error.message}`, { error: error })
    process.exit(1)
  })
