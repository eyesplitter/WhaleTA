import { PriceRepository } from "../repositories/PriceRepository";
import { Price, ProviderResponse } from "../types";

export class PriceManager {
  private priceRepository: PriceRepository;
  private readonly PAIRS_TO_CURRENCY_IDS: Record<string, string[]> = {
    "ton-usdt": ["the-open-network", "tether"]
  };
  private readonly MAX_PRICE_AGE_MINUTES = 1;

  constructor(priceRepository: PriceRepository) {
    this.priceRepository = priceRepository;
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

    const lastPrice = await this.priceRepository.getLastPrice(pair);
    
    if (lastPrice && !this.isPriceStale(lastPrice.timestamp)) {
      console.log('Using cached price from', lastPrice.timestamp.toISOString());
      return {
        price: lastPrice.price,
        reversePrice: 1 / lastPrice.price
      };
    }

    console.log('Fetching new price');
    const price = await this.fetchPrice(currencies);
    const fromPrice = price.price[currencies[0]].usd;
    const toPrice = price.price[currencies[1]].usd;
    const pairPrice = fromPrice / toPrice;

    await this.priceRepository.savePrice(pair, pairPrice, price.providerId);
    
    return {
      price: pairPrice,
      reversePrice: 1 / pairPrice
    };
  }
} 