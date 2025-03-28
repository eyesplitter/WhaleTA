import { PriceManager } from "../../managers/PriceManager"
import { PriceRepository } from "../../repositories/PriceRepository"
import { RedisRepository } from "../../repositories/RedisRepository"
import { HistoricPriceRepository } from "../../repositories/HistoricPriceRepository"
import { Price } from "../../types"

jest.mock("../../repositories/PriceRepository")
jest.mock("../../repositories/RedisRepository")
jest.mock("../../repositories/HistoricPriceRepository")

describe("PriceManager", () => {
  let priceManager: PriceManager
  let mockPriceRepository: jest.Mocked<PriceRepository>
  let mockRedisRepository: jest.Mocked<RedisRepository>
  let mockHistoricPriceRepository: jest.Mocked<HistoricPriceRepository>

  beforeEach(() => {
    mockPriceRepository = new PriceRepository({} as any) as jest.Mocked<PriceRepository>
    mockRedisRepository = new RedisRepository("") as jest.Mocked<RedisRepository>
    mockHistoricPriceRepository = new HistoricPriceRepository({} as any) as jest.Mocked<HistoricPriceRepository>

    priceManager = new PriceManager(mockPriceRepository, mockRedisRepository, mockHistoricPriceRepository)
  })

  describe("getPairPrice", () => {
    const mockPair = "ton-usdt"
    const mockPrice = 2.5
    const mockProviderId = 1
    const mockTimestamp = new Date()

    it("should return cached price from Redis if not stale", async () => {
      mockRedisRepository.getPrice.mockResolvedValue({
        price: mockPrice,
        timestamp: mockTimestamp,
        provider_id: mockProviderId,
      })

      const result = await priceManager.getPairPrice(mockPair)

      expect(result).toEqual({
        price: mockPrice,
        reversePrice: 1 / mockPrice,
      })
      expect(mockRedisRepository.getPrice).toHaveBeenCalledWith(mockPair)
      expect(mockPriceRepository.getLastPrice).not.toHaveBeenCalled()
    })

    it("should fetch new price if Redis cache is stale", async () => {
      const staleTimestamp = new Date(mockTimestamp.getTime() - 30 * 60 * 1000)
      mockRedisRepository.getPrice.mockResolvedValue({
        price: mockPrice,
        timestamp: staleTimestamp,
        provider_id: mockProviderId,
      })

      const mockPriceData: Price = {
        price: {
          "the-open-network": { usd: 2.5 },
          tether: { usd: 1 },
        },
        providerId: mockProviderId,
      }

      mockPriceRepository.getProviders.mockResolvedValue([
        { id: mockProviderId, name: "test", base_url: "http://test.com/{action}/{currency}" },
      ])

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPriceData.price),
      })

      const result = await priceManager.getPairPrice(mockPair)

      expect(result).toEqual({
        price: 2.5,
        reversePrice: 1 / 2.5,
      })
      expect(mockRedisRepository.setPrice).toHaveBeenCalled()
      expect(mockPriceRepository.savePrice).toHaveBeenCalled()
      expect(mockHistoricPriceRepository.saveHistoricPrice).toHaveBeenCalled()
    })

    it("should throw error for invalid pair", async () => {
      await expect(priceManager.getPairPrice("invalid-pair")).rejects.toThrow("Pair invalid-pair not found")
    })
  })

  describe("getHistoricPrices", () => {
    it("should return historic prices for given period", async () => {
      const mockPair = "ton-usdt"
      const from = new Date("2024-02-28")
      const to = new Date("2024-02-29")
      const mockHistoricData = [
        {
          pair: mockPair,
          price: 2.5,
          provider_id: 1,
          timestamp: new Date(),
        },
      ]

      mockHistoricPriceRepository.getHistoricPrices.mockResolvedValue(mockHistoricData)

      const result = await priceManager.getHistoricPrices(mockPair, from, to)

      expect(result).toEqual(mockHistoricData)
      expect(mockHistoricPriceRepository.getHistoricPrices).toHaveBeenCalledWith(mockPair, from, to)
    })
  })
})
