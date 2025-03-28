import { Pool } from "pg"

export interface HistoricPriceData {
  pair: string
  price: number
  provider_id: number
  timestamp: Date
}

export class HistoricPriceRepository {
  private pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
  }

  async saveHistoricPrice(data: HistoricPriceData): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO historical_crypto_prices 
        (pair, price, provider_id, timestamp) 
        VALUES ($1, $2, $3, $4)`,
        [data.pair, data.price, data.provider_id, data.timestamp],
      )
    } catch (error) {
      console.error("error saveHistoricPrice", error.message)
      throw error
    }
  }

  async getHistoricPrices(pair: string, from: Date, to: Date): Promise<HistoricPriceData[]> {
    try {
      const result = await this.pool.query(
        `SELECT pair, price, provider_id, timestamp 
        FROM historical_crypto_prices 
        WHERE pair = $1 AND timestamp BETWEEN $2 AND $3 
        ORDER BY timestamp DESC`,
        [pair, from, to],
      )
      console.log("result", result.rows, from, to)
      return result.rows
    } catch (error) {
      console.error("error getHistoricPrices", error.message)
      throw error
    }
  }
}
