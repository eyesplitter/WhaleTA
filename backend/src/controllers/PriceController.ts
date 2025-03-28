import { Request, Response } from "express";
import { PriceManager } from "../managers/PriceManager";

export class PriceController {
  private priceManager: PriceManager;

  constructor(priceManager: PriceManager) {
    this.priceManager = priceManager;
  }

  async getPrice(req: Request, res: Response): Promise<void> {
    const pair = req.params.pair;
    try {
      const result = await this.priceManager.getPairPrice(pair);
      res.json({ pair, ...result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  healthCheck(req: Request, res: Response): void {
    res.json({ status: "ok", message: "it works" });
  }
} 