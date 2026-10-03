/** Minimal shape so the chart works for both API items and learner demo data. */
export interface CompetencyChartItem {
  competencyName: string;
  requiredLevel: number;
  currentLevel: number | null;
}

export interface CompetencyChartPoint {
  competency: string;
  required: number;
  confirmed: number;
}

/** Required vs confirmed series for the competency chart; unconfirmed levels plot as 0. */
export function toChartData(items: CompetencyChartItem[]): CompetencyChartPoint[] {
  return items.map((i) => ({
    competency: i.competencyName,
    required: i.requiredLevel,
    confirmed: i.currentLevel ?? 0,
  }));
}
