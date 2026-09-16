import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Activity, UserPlus, Clock, AlertTriangle } from 'lucide-react';
import { analyticsService, type AnalyticsOverview } from '../../services/analytics/analyticsService';

const RANGE_OPTIONS = [
  { label: '7 jours', value: 7 },
  { label: '30 jours', value: 30 },
  { label: '90 jours', value: 90 },
];

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
      <div className="p-2.5 rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-700" />
      </div>
      <div>
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function SuperAdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    analyticsService
      .getOverview(days)
      .then(res => {
        if (!cancelled) setData(res);
      })
      .catch(err => {
        if (!cancelled) setErrorMsg(err.message || 'Erreur de chargement des statistiques.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Audience & Analytique</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Visites du site public, sessions et provenance géographique (Google Analytics 4).
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                days === opt.value ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {data?.simulated && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {data.notice || 'Google Analytics n\'est pas encore configuré : les chiffres ci-dessous sont simulés.'}
            {' '}Renseignez <code className="font-mono">VITE_GA_MEASUREMENT_ID</code>, <code className="font-mono">GA_PROPERTY_ID</code>,{' '}
            <code className="font-mono">GA_CLIENT_EMAIL</code> et <code className="font-mono">GA_PRIVATE_KEY</code> dans vos variables d'environnement pour des données réelles.
          </span>
        </div>
      )}

      {errorMsg && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{errorMsg}</div>}

      {loading ? (
        <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Visiteurs actifs" value={data.totals.activeUsers.toLocaleString('fr-FR')} />
            <StatCard icon={Activity} label="Sessions" value={data.totals.sessions.toLocaleString('fr-FR')} />
            <StatCard icon={UserPlus} label="Nouveaux visiteurs" value={data.totals.newUsers.toLocaleString('fr-FR')} />
            <StatCard icon={Clock} label="Durée moy. session" value={`${data.totals.avgSessionDurationSec}s`} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Évolution des visites</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.byDate}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="visitors" name="Visiteurs" stroke="#0f172a" fill="url(#colorVisitors)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Visiteurs par pays</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.byCountry} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="country" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="activeUsers" name="Visiteurs" fill="#0f172a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
