import { Request, Response } from "express"
import { PriceController } from "../../controllers/PriceController"
import { PriceManager } from "../../managers/PriceManager"

jest.mock("../../managers/PriceManager")

describe("PriceController", () => {
  let priceController: PriceController
  let mockPriceManager: jest.Mocked<PriceManager>
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockJson: jest.Mock
  let mockStatus: jest.Mock

  beforeEach(() => {
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnThis()
    mockRes = {
      json: mockJson,
      status: mockStatus,
    }

    mockPriceManager = new PriceManager({} as any, {} as any, {} as any) as jest.Mocked<PriceManager>
    priceController = new PriceController(mockPriceManager)
  })

  describe("getPrice", () => {
    it("should return price data for valid pair", async () => {
      const mockPair = "ton-usdt"
      const mockPrice = 2.5
      mockReq = { params: { pair: mockPair } }
      mockPriceManager.getPairPrice.mockResolvedValue({
        price: mockPrice,
        reversePrice: 1 / mockPrice,
      })

      await priceController.getPrice(mockReq as Request, mockRes as Response)

      expect(mockPriceManager.getPairPrice).toHaveBeenCalledWith(mockPair)
      expect(mockJson).toHaveBeenCalledWith({
        pair: mockPair,
        price: mockPrice,
        reversePrice: 1 / mockPrice,
      })
    })

    it("should handle errors and return 500 status", async () => {
      const mockPair = "ton-usdt"
      const mockError = new Error("Test error")
      mockReq = { params: { pair: mockPair } }
      mockPriceManager.getPairPrice.mockRejectedValue(mockError)

      await priceController.getPrice(mockReq as Request, mockRes as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({ error: mockError.message })
    })
  })

  describe("getHistoricPrices", () => {
    it("should return historic prices for valid period", async () => {
      const mockPair = "ton-usdt"
      const mockFrom = "2024-02-28T00:00:00Z"
      const mockTo = "2024-02-29T00:00:00Z"
      const mockHistoricData = [
        {
          pair: mockPair,
          price: 2.5,
          provider_id: 1,
          timestamp: new Date(),
        },
      ]

      mockReq = {
        params: { pair: mockPair },
        query: { from: mockFrom, to: mockTo },
      }
      mockPriceManager.getHistoricPrices.mockResolvedValue(mockHistoricData)

      await priceController.getHistoricPrices(mockReq as Request, mockRes as Response)

      expect(mockPriceManager.getHistoricPrices).toHaveBeenCalledWith(mockPair, new Date(mockFrom), new Date(mockTo))
      expect(mockJson).toHaveBeenCalledWith(mockHistoricData)
    })

    it("should handle errors and return 500 status", async () => {
      const mockPair = "ton-usdt"
      const mockError = new Error("Test error")
      mockReq = {
        params: { pair: mockPair },
        query: { from: "2024-02-28T00:00:00Z", to: "2024-02-29T00:00:00Z" },
      }
      mockPriceManager.getHistoricPrices.mockRejectedValue(mockError)

      await priceController.getHistoricPrices(mockReq as Request, mockRes as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({ error: mockError.message })
    })
  })

  describe("healthCheck", () => {
    it("should return health check status", () => {
      priceController.healthCheck(mockReq as Request, mockRes as Response)

      expect(mockJson).toHaveBeenCalledWith({
        status: "ok",
        message: "it works",
      })
    })
  })
})
