import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGeo } from '../../contexts/GeoContext';
import { propertyService } from '../../services/properties/propertyService';
import { tenantService } from '../../services/tenants/tenantService';
import { contractService } from '../../services/contracts/contractService';
import { paymentService } from '../../services/payments/paymentService';
import { visitService } from '../../services/visits/visitService';
import type { Property, Tenant, Payment, VisitRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Building,
  Users,
  CreditCard,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileText,
  ShieldCheck,
  Clock,
  ShieldAlert,
  UploadCloud,
} from 'lucide-react';

export function DashboardOverviewPage() {
  const navigate = useNavigate();
  const { profile, isVerified } = useAuth();
  const { currentCurrency, formatPrice } = useGeo();

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [pendingVisits, setPendingVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Financial stats (strictly computed from real payments & contracts)
  const [monthlyCollected, setMonthlyCollected] = useState(0);
  const [totalExpectedRent, setTotalExpectedRent] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [propsList, tensList, contractsList, paysList, visitsList] = await Promise.all([
          propertyService.getMyProperties(),
          tenantService.getMyTenants(),
          contractService.getMyContracts(),
          paymentService.getMyPayments(),
          visitService.getMyVisitRequests(),
        ]);

        setProperties(propsList);
        setTenants(tensList);
        setRecentPayments(paysList.slice(0, 5));
        setPendingVisits(visitsList.filter((v) => v.status === 'pending').slice(0, 5));

        // Compute monthly collected this calendar month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const collected = paysList
          .filter((p) => {
            if (p.status !== 'completed') return false;
            const pDate = new Date(p.payment_date);
            return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
          })
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        setMonthlyCollected(collected);

        // Expected monthly rent from active contracts
        const activeContracts = contractsList.filter((c) => c.status === 'active');
        const expected = activeContracts.reduce((sum, c) => sum + Number(c.rent_amount || 0), 0);
        setTotalExpectedRent(expected);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalProps = properties.length;
  const rentedProps = properties.filter((p) => p.status === 'rented').length;
  const availableProps = properties.filter((p) => p.status === 'available').length;
  const occupancyRate = totalProps > 0 ? Math.round((rentedProps / totalProps) * 100) : 0;

  const verificationStatus = profile?.verification_status || 'unverified';

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Bonjour, {profile?.full_name || 'Bailleur'}
            </h1>
            {verificationStatus === 'verified' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Certifié
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tableau de bord de gestion locative • Données en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/dashboard/payments/create')}
            className="text-xs font-semibold"
          >
            <Receipt className="mr-1.5 h-3.5 w-3.5" />
            Encaisser un loyer
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/dashboard/properties/create')}
            className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Ajouter un logement
          </Button>
        </div>
      </div>

      {/* Verification status Banner */}
      {verificationStatus === 'pending' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">Dossier d'identification en cours de validation</h4>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Votre pièce d'identité a été transmise. Notre équipe de conformité examine les documents sous 24h ouvrées. Dès approbation, vos annonces afficheront le badge <strong>Bailleur Certifié</strong>.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/dashboard/settings?tab=verification')}
            className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0"
          >
            Voir mes pièces
          </Button>
        </div>
      )}

      {verificationStatus === 'unverified' && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-950">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-950">Obtenez le Badge Bailleur Certifié</h4>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                Rassurez les locataires en quête de chambre : téléversez votre CNI ou Registre de Commerce pour certifier votre compte et booster la visibilité de vos biens.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/dashboard/settings?tab=verification')}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white shrink-0 font-bold"
          >
            <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
            Soumettre ma CNI
          </Button>
        </div>
      )}

      {/* Zero property banner if brand new account */}
      {!loading && totalProps === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Bienvenue sur votre espace de gestion LoyerPro
            </h3>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Vous n'avez pas encore configuré votre première chambre ou logement. Ajoutez vos biens pour éditer vos baux, suivre vos encaissements et publier des annonces vérifiées.
            </p>
          </div>
          <Button
            onClick={() => navigate('/dashboard/properties/create')}
            variant="primary"
            size="md"
            className="mt-4 sm:mt-0 shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-bold"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Ajouter mon premier logement
          </Button>
        </div>
      )}

      {/* Top Metric Cards - Real computed values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Properties */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Logements & Chambres</span>
            <Building className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{totalProps}</span>
            <span className="text-xs text-slate-500 font-medium">{occupancyRate}% occupés</span>
          </div>
          <div className="text-[11px] text-slate-400 flex gap-2">
            <span>{rentedProps} loué(s)</span>
            <span>•</span>
            <span>{availableProps} disponible(s)</span>
          </div>
        </div>

        {/* Metric 2: Active Tenants */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Locataires Actifs</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{tenants.length}</span>
            <Link
              to="/dashboard/tenants"
              className="text-xs text-slate-700 hover:text-slate-900 font-bold"
            >
              Gérer
            </Link>
          </div>
          <p className="text-[11px] text-slate-400">
            Dossiers avec coordonnées & pièces
          </p>
        </div>

        {/* Metric 3: Monthly Collected */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Loyers Encaissés</span>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {formatPrice(monthlyCollected, currentCurrency)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Mois en cours (sur {formatPrice(totalExpectedRent, currentCurrency)} attendus)
          </p>
        </div>

        {/* Metric 4: Pending Visits */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Demandes de Visite</span>
            <Calendar className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">
              {pendingVisits.length}
            </span>
            <Link
              to="/dashboard/visits"
              className="text-xs text-slate-700 hover:text-slate-900 font-bold"
            >
              Consulter
            </Link>
          </div>
          <p className="text-[11px] text-slate-400">
            Visiteurs attendant une confirmation
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Payments & Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">Derniers loyers enregistrés</h2>
            </div>
            <Link
              to="/dashboard/payments"
              className="text-xs font-bold text-slate-700 hover:text-slate-900"
            >
              Tout voir
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : recentPayments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">
                      {payment.tenant?.full_name || 'Locataire'}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {payment.month} • {payment.payment_method} {payment.reference ? `(${payment.reference})` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      {formatPrice(payment.amount, currentCurrency)}
                    </span>
                    <Badge
                      variant={payment.status === 'completed' ? 'success' : 'warning'}
                      className="text-[10px] py-0 font-semibold"
                    >
                      {payment.status === 'completed' ? 'Payé' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 space-y-2">
              <p>Aucun paiement de loyer enregistré pour le moment.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/dashboard/payments/create')}
                className="text-xs"
              >
                Enregistrer un premier paiement
              </Button>
            </div>
          )}
        </div>

        {/* Pending Visits Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">Demandes de visite à traiter</h2>
            </div>
            <Link
              to="/dashboard/visits"
              className="text-xs font-bold text-slate-700 hover:text-slate-900"
            >
              Gérer les visites
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : pendingVisits.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pendingVisits.map((visit) => (
                <div key={visit.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{visit.visitor_name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {visit.property?.title || 'Bien'} • Date : {visit.preferred_date} à {visit.preferred_time || '10:00'}
                    </p>
                    <p className="text-slate-500 text-[11px]">Tél : {visit.visitor_phone}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning" className="text-[10px] font-semibold">
                      En attente
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              <p>Aucune demande de visite en attente.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Lorsque des visiteurs demanderont une visite sur vos biens publiés, leurs coordonnées apparaîtront ici.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
