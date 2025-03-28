import { Request, Response } from "express"
import { PriceManager } from "../managers/PriceManager"

export class PriceController {
  constructor(private priceManager: PriceManager) {}

  async getPrice(req: Request, res: Response) {
    const pair = req.params.pair
    try {
      const result = await this.priceManager.getPairPrice(pair)
      res.json({ pair, ...result })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  async getHistoricPrices(req: Request, res: Response) {
    const pair = req.params.pair
    const from = new Date(req.query.from as string)
    const to = new Date(req.query.to as string)

    try {
      const prices = await this.priceManager.getHistoricPrices(pair, from, to)
      console.log("prices", prices)
      res.json(prices)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  healthCheck(req: Request, res: Response) {
    res.json({ status: "ok", message: "it works" })
  }
}
