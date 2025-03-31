export interface ProviderResponse {
  [key: string]: { usd: number }
}

export interface Price {
  price: { [key: string]: { usd: number } }
  providerId: number
}

export interface Provider {
  id: number
  name: string
  base_url: string
}


export interface Config {
  port: number
  databaseUrl: string
  redisUrl: string
}
