export type FilterPeriod = 'all' | 'month' | 'custom';

export interface DateFilter {
  period: FilterPeriod;
  startDate?: Date;
  endDate?: Date;
  selectedMonth?: string; // YYYY-MM format
}

export interface FilteredData {
  totalCount: number;
  filteredCount: number;
  startDate?: Date;
  endDate?: Date;
}
