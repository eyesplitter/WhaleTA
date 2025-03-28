import express, { response } from "express"
import dotenv from "dotenv"
import { Pool } from "pg"
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

interface ProviderResponse {
  [key: string]: {usd: number}
}

interface Price {
  price: {[key: string]: {usd: number} }
  providerId: number
}
  
const app = express()
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const PAIRS_TO_CURRENCY_IDS: Record<string, string[]> = {
  "ton-usdt": ["the-open-network", "tether"]
}

async function fetchPrice(currencies: string[]) {
  try {
    const providers = await getProviders()
    for (const provider of providers) {
      const url = provider.base_url.replace('{action}', 'price').replace('{currency}', currencies.join(','))
      const response = await fetch(url)

      if (!response.ok) {
        console.warn(`Provider ${provider.name} failed with status: ${response.status} ${response.statusText}`)
        continue
      }
      const data = await response.json() as ProviderResponse
      return {
        price: data,
        providerId: provider.id
      }
    }

  } catch (error) {
    console.error("error fetchPrice", error.message)
    throw new Error("error fetchPrice")
  }

  throw new Error("All providers failed")
}

async function savePrice(pair: string, price: number, providerId: number) {
  try {
    await pool.query(
      "INSERT INTO crypto_prices (pair, price, timestamp, provider_id) VALUES ($1, $2, NOW(), $3) ON CONFLICT (pair) DO UPDATE SET price = EXCLUDED.price, timestamp = NOW()",
      [pair, price, providerId],
    )
  } catch (error) {
    console.error("error saveTonPrice", error.message)
  }
}

async function getProviders() {
  try {
    const result = await pool.query("SELECT * FROM providers")
    return result.rows
  } catch (error) {
    console.error("error getProviders", error.message)
    throw new Error("error getProviders")
  }
}

app.get("/price/:pair", async (req, res) => {
  const pair = req.params.pair
  try {
    const currencies = PAIRS_TO_CURRENCY_IDS[pair]
    
    if(!currencies) {
      throw new Error(`Pair ${pair} not found`)
    }

    const price = await fetchPrice(currencies)

    const fromPrice = price.price[currencies[0]].usd
    const toPrice = price.price[currencies[1]].usd
    const pairPrice = fromPrice / toPrice;

    await savePrice(pair, pairPrice, price.providerId);
    res.json({ pair, price: pairPrice, reversePrice: 1 / pairPrice })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


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
