import { PriceRepository } from "../repositories/PriceRepository";
import { RedisRepository } from "../repositories/RedisRepository";
import { Price, ProviderResponse } from "../types";

export class PriceManager {
  private priceRepository: PriceRepository;
  private redisRepository: RedisRepository;
  private readonly PAIRS_TO_CURRENCY_IDS: Record<string, string[]> = {
    "ton-usdt": ["the-open-network", "tether"]
  };
  private readonly MAX_PRICE_AGE_MINUTES = 1;

  constructor(priceRepository: PriceRepository, redisRepository: RedisRepository) {
    this.priceRepository = priceRepository;
    this.redisRepository = redisRepository;
  }

  private isPriceStale(lastUpdate: Date): boolean {
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    console.log('diffMinutes', diffMinutes, 'lastUpdate', lastUpdate.toISOString(), 'now', now.toISOString());
    return diffMinutes > this.MAX_PRICE_AGE_MINUTES;
  }

  async fetchPrice(currencies: string[]): Promise<Price> {
    try {
      const providers = await this.priceRepository.getProviders();
      for (const provider of providers) {
        const url = provider.base_url.replace('{action}', 'price').replace('{currency}', currencies.join(','));
        const response = await fetch(url);

        if (!response.ok) {
          console.warn(`Provider ${provider.name} failed with status: ${response.status} ${response.statusText}`);
          continue;
        }
        const data = await response.json() as ProviderResponse;
        return {
          price: data,
          providerId: provider.id
        };
      }
    } catch (error) {
      console.error("error fetchPrice", error.message);
      throw new Error("error fetchPrice");
    }

    throw new Error("All providers failed");
  }

  async getPairPrice(pair: string): Promise<{ price: number; reversePrice: number }> {
    const currencies = this.PAIRS_TO_CURRENCY_IDS[pair];
    
    if (!currencies) {
      throw new Error(`Pair ${pair} not found`);
    }

    const redisPrice = await this.redisRepository.getPrice(pair);
    if (redisPrice && !this.isPriceStale(redisPrice.timestamp)) {
      console.log('Using Redis cached price from', redisPrice.timestamp.toISOString());
      return {
        price: redisPrice.price,
        reversePrice: 1 / redisPrice.price
      };
    }

    const dbPrice = await this.priceRepository.getLastPrice(pair);
    if (dbPrice && !this.isPriceStale(dbPrice.timestamp)) {
      console.log('Using DB cached price from', dbPrice.timestamp.toISOString());
      await this.redisRepository.setPrice(pair, dbPrice);
      return {
        price: dbPrice.price,
        reversePrice: 1 / dbPrice.price
      };
    }

    console.log('Fetching new price');
    const price = await this.fetchPrice(currencies);
    const fromPrice = price.price[currencies[0]].usd;
    const toPrice = price.price[currencies[1]].usd;
    const pairPrice = fromPrice / toPrice;

    const priceData = {
      price: pairPrice,
      timestamp: new Date(),
      provider_id: price.providerId
    };

    await Promise.all([
      this.priceRepository.savePrice(pair, pairPrice, price.providerId),
      this.redisRepository.setPrice(pair, priceData)
    ]);
    
    return {
      price: pairPrice,
      reversePrice: 1 / pairPrice
    };
  }
} 