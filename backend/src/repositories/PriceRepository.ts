import { Pool } from "pg";
import { Provider } from "../types";

export class PriceRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async savePrice(pair: string, price: number, providerId: number): Promise<void> {
    try {
      await this.pool.query(
        "INSERT INTO crypto_prices (pair, price, timestamp, provider_id) VALUES ($1, $2, NOW(), $3) ON CONFLICT (pair) DO UPDATE SET price = EXCLUDED.price, timestamp = NOW()",
        [pair, price, providerId],
      );
    } catch (error) {
      console.error("error savePrice", error.message);
      throw error;
    }
  }

  async getProviders(): Promise<Provider[]> {
    try {
      const result = await this.pool.query("SELECT * FROM providers");
      return result.rows;
    } catch (error) {
      console.error("error getProviders", error.message);
      throw error;
    }
  }
} 