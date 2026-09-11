// LoyerPro - Service d'analytique (consommé par SuperAdminAnalyticsPage)
// Interroge /api/analytics/overview (server.ts), qui lui-même interroge
// l'API Google Analytics Data (GA4) côté serveur avec un compte de service.

export interface AnalyticsOverview {
  simulated: boolean;
  notice?: string;
  error?: string;
  totals: {
    activeUsers: number;
    sessions: number;
    newUsers: number;
    avgSessionDurationSec: number;
  };
  byDate: { date: string; visitors: number }[];
  byCountry: { country: string; activeUsers: number }[];
}

export const analyticsService = {
  async getOverview(days: number = 30): Promise<AnalyticsOverview> {
    const res = await fetch(`/api/analytics/overview?days=${days}`);
    if (!res.ok) throw new Error("Impossible de récupérer les statistiques d'audience.");
    return res.json();
  },
};
