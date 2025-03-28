import { createClient } from 'redis';
import { PriceData } from './PriceRepository';

export class RedisRepository {
  private client;

  constructor(redisUrl: string) {
    this.client = createClient({
      url: redisUrl
    });
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.disconnect();
  }

  async getPrice(pair: string): Promise<PriceData | null> {
    try {
      const data = await this.client.get(`price:${pair}`);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        timestamp: new Date(parsed.timestamp)
      };
    } catch (error) {
      console.error('Redis getPrice error:', error);
      return null;
    }
  }

  async setPrice(pair: string, priceData: PriceData): Promise<void> {
    try {
      await this.client.set(
        `price:${pair}`,
        JSON.stringify({
          ...priceData,
          timestamp: priceData.timestamp.toISOString()
        })
      );
    } catch (error) {
      console.error('Redis setPrice error:', error);
    }
  }
} 