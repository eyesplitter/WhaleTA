import { Pool } from "pg"
import { Provider } from "../types"

export interface PriceData {
  price: number
  timestamp: Date
  provider_id: number
}

export class PriceRepository {
  private pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
  }

  async savePrice(pair: string, price: number, providerId: number): Promise<void> {
    try {
      await this.pool.query(
        "INSERT INTO crypto_prices (pair, price, timestamp, provider_id) VALUES ($1, $2, NOW() AT TIME ZONE 'UTC', $3) ON CONFLICT (pair) DO UPDATE SET price = EXCLUDED.price, timestamp = NOW() AT TIME ZONE 'UTC'",
        [pair, price, providerId],
      )
    } catch (error) {
      console.error("error savePrice", error.message)
      throw error
    }
  }

  async getLastPrice(pair: string): Promise<PriceData | null> {
    try {
      const result = await this.pool.query(
        "SELECT price, timestamp AT TIME ZONE 'UTC' as timestamp, provider_id FROM crypto_prices WHERE pair = $1",
        [pair],
      )
      return result.rows[0] || null
    } catch (error) {
      console.error("error getLastPrice", error.message)
      throw error
    }
  }

  async getProviders(): Promise<Provider[]> {
    try {
      const result = await this.pool.query("SELECT * FROM providers")
      return result.rows
    } catch (error) {
      console.error("error getProviders", error.message)
      throw error
    }
  }
}
