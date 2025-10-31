export interface AdCost {
  id: string;
  startDate: Date;
  endDate: Date;
  cost: number;
  description?: string;
}

export interface AdPerformance {
  period: string;
  totalCost: number;
  responseCount: number;
  costPerResponse: number;
  responseCounts: {
    date: string;
    count: number;
  }[];
}
