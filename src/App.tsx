import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GeoProvider } from './contexts/GeoContext';
import { trackPageView } from './lib/gtag';
import { subscriptionService } from './services/subscriptions/subscriptionService';

// Layouts
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { OwnerLayout } from './components/layout/OwnerLayout';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';
import { CookieBanner } from './components/layout/CookieBanner';
import { VercelInsights } from './components/analytics/VercelInsights';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { PropertiesPage } from './pages/public/PropertiesPage';
import { PropertyDetailPage } from './pages/public/PropertyDetailPage';
import { PricingPage } from './pages/public/PricingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard Pages (chargées à la demande : le site public reste léger)

const DashboardOverviewPage = lazy(() => import('./pages/dashboard/DashboardOverviewPage').then((m) => ({ default: m.DashboardOverviewPage })));
const PropertiesListPage = lazy(() => import('./pages/dashboard/properties/PropertiesListPage').then((m) => ({ default: m.PropertiesListPage })));
const PropertyFormPage = lazy(() => import('./pages/dashboard/properties/PropertyFormPage').then((m) => ({ default: m.PropertyFormPage })));
const TenantsListPage = lazy(() => import('./pages/dashboard/tenants/TenantsListPage').then((m) => ({ default: m.TenantsListPage })));
const TenantFormPage = lazy(() => import('./pages/dashboard/tenants/TenantFormPage').then((m) => ({ default: m.TenantFormPage })));
const ContractsListPage = lazy(() => import('./pages/dashboard/contracts/ContractsListPage').then((m) => ({ default: m.ContractsListPage })));
const ContractFormPage = lazy(() => import('./pages/dashboard/contracts/ContractFormPage').then((m) => ({ default: m.ContractFormPage })));
const PaymentsListPage = lazy(() => import('./pages/dashboard/payments/PaymentsListPage').then((m) => ({ default: m.PaymentsListPage })));
const PaymentFormPage = lazy(() => import('./pages/dashboard/payments/PaymentFormPage').then((m) => ({ default: m.PaymentFormPage })));
const ExpensesListPage = lazy(() => import('./pages/dashboard/expenses/ExpensesListPage').then((m) => ({ default: m.ExpensesListPage })));
const ExpenseFormPage = lazy(() => import('./pages/dashboard/expenses/ExpenseFormPage').then((m) => ({ default: m.ExpenseFormPage })));
const VisitsListPage = lazy(() => import('./pages/dashboard/visits/VisitsListPage').then((m) => ({ default: m.VisitsListPage })));
const InquiriesListPage = lazy(() => import('./pages/dashboard/inquiries/InquiriesListPage').then((m) => ({ default: m.InquiriesListPage })));
const FinancialReportsPage = lazy(() => import('./pages/dashboard/reports/FinancialReportsPage').then((m) => ({ default: m.FinancialReportsPage })));
const SettingsPage = lazy(() => import('./pages/dashboard/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));

// SuperAdmin Pages
const SuperAdminDashboardPage = lazy(() => import('./pages/superadmin/SuperAdminDashboardPage').then((m) => ({ default: m.SuperAdminDashboardPage })));
const SuperAdminUsersPage = lazy(() => import('./pages/superadmin/SuperAdminUsersPage').then((m) => ({ default: m.SuperAdminUsersPage })));
const SuperAdminPropertiesPage = lazy(() => import('./pages/superadmin/SuperAdminPropertiesPage').then((m) => ({ default: m.SuperAdminPropertiesPage })));
const SuperAdminSubscriptionsPage = lazy(() => import('./pages/superadmin/SuperAdminSubscriptionsPage').then((m) => ({ default: m.SuperAdminSubscriptionsPage })));
const SuperAdminPaymentsPage = lazy(() => import('./pages/superadmin/SuperAdminPaymentsPage').then((m) => ({ default: m.SuperAdminPaymentsPage })));
const SuperAdminSettingsPage = lazy(() => import('./pages/superadmin/SuperAdminSettingsPage').then((m) => ({ default: m.SuperAdminSettingsPage })));
const SuperAdminPlansPage = lazy(() => import('./pages/superadmin/SuperAdminPlansPage').then((m) => ({ default: m.SuperAdminPlansPage })));
const SuperAdminAnalyticsPage = lazy(() => import('./pages/superadmin/SuperAdminAnalyticsPage').then((m) => ({ default: m.SuperAdminAnalyticsPage })));

// Envoie un événement page_view à Google Analytics à chaque changement de route
function AnalyticsRouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

// Remonte en haut à chaque nouvelle page, et gère les ancres (#verification...)
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}

// Helper component for public page frame
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <PublicNavbar />
      <main id="contenu" className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

// Protected Route wrapper for Owner/Dashboard
function ProtectedOwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, isSuperAdmin, loading, isSupabaseConfigured } = useAuth();
  const location = useLocation();

  // Tant que l'utilisateur n'a pas explicitement choisi un forfait (même
  // gratuit) depuis Paramètres > Abonnement, on bloque l'accès au reste du
  // tableau de bord et on l'y redirige. La page Paramètres elle-même reste
  // toujours accessible, sinon personne ne pourrait jamais choisir de plan.
  const [subCheckDone, setSubCheckDone] = useState(false);
  const [hasPlan, setHasPlan] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured || !user || isSuperAdmin) {
      setSubCheckDone(true);
      return;
    }
    setSubCheckDone(false);
    subscriptionService.getMySubscription(user.id).then((sub) => {
      if (!cancelled) {
        setHasPlan(Boolean(sub));
        setSubCheckDone(true);
      }
    }).catch(() => {
      if (!cancelled) setSubCheckDone(true); // en cas d'erreur réseau, on ne bloque pas indéfiniment
    });
    return () => { cancelled = true; };
  }, [user?.id, isSuperAdmin, isSupabaseConfigured]);

  if (loading || !subCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs text-slate-500 font-medium">Chargement de votre session...</div>
      </div>
    );
  }

  // Une fois Supabase connecté, l'espace propriétaire/agence exige une session valide.
  // Avant configuration (premier lancement local), on laisse passer pour permettre la démo.
  if (isSupabaseConfigured && !user) {
    return <Navigate to="/login" replace />;
  }

  // Le superadmin garde son propre espace dédié
  if (isSuperAdmin) {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  const isSettingsPage = location.pathname.startsWith('/dashboard/settings');
  if (isSupabaseConfigured && hasPlan === false && !isSettingsPage) {
    return <Navigate to="/dashboard/settings?tab=subscription" replace />;
  }

  return <OwnerLayout>{children}</OwnerLayout>;
}

// Protected Route wrapper for SuperAdmin
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isSuperAdmin, loading, isSupabaseConfigured } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-xs text-slate-400 font-medium">Vérification des droits d'administration...</div>
      </div>
    );
  }

  if (isSupabaseConfigured && !user) {
    return <Navigate to="/login" replace />;
  }

  if (isSupabaseConfigured && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <GeoProvider>
        <BrowserRouter>
          <AnalyticsRouteTracker />
          <ScrollManager />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Portal */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/properties" element={<PublicLayout><PropertiesPage /></PublicLayout>} />
            <Route path="/properties/:id" element={<PublicLayout><PropertyDetailPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/politique-de-confidentialite" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
            <Route path="/conditions-generales" element={<PublicLayout><TermsPage /></PublicLayout>} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Owner Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedOwnerRoute><DashboardOverviewPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/properties" element={<ProtectedOwnerRoute><PropertiesListPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/properties/create" element={<ProtectedOwnerRoute><PropertyFormPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/properties/:id/edit" element={<ProtectedOwnerRoute><PropertyFormPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/tenants" element={<ProtectedOwnerRoute><TenantsListPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/tenants/create" element={<ProtectedOwnerRoute><TenantFormPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/tenants/:id/edit" element={<ProtectedOwnerRoute><TenantFormPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/contracts" element={<ProtectedOwnerRoute><ContractsListPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/contracts/create" element={<ProtectedOwnerRoute><ContractFormPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/payments" element={<ProtectedOwnerRoute><PaymentsListPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/payments/create" element={<ProtectedOwnerRoute><PaymentFormPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/expenses" element={<ProtectedOwnerRoute><ExpensesListPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/expenses/create" element={<ProtectedOwnerRoute><ExpenseFormPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/visits" element={<ProtectedOwnerRoute><VisitsListPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/inquiries" element={<ProtectedOwnerRoute><InquiriesListPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/reports" element={<ProtectedOwnerRoute><FinancialReportsPage /></ProtectedOwnerRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedOwnerRoute><SettingsPage /></ProtectedOwnerRoute>} />

          {/* SuperAdmin Routes */}
          <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="/superadmin/dashboard" element={<ProtectedAdminRoute><SuperAdminDashboardPage /></ProtectedAdminRoute>} />
          <Route path="/superadmin/users" element={<ProtectedAdminRoute><SuperAdminUsersPage /></ProtectedAdminRoute>} />
          <Route path="/superadmin/properties" element={<ProtectedAdminRoute><SuperAdminPropertiesPage /></ProtectedAdminRoute>} />
          <Route path="/superadmin/plans" element={<ProtectedAdminRoute><SuperAdminPlansPage /></ProtectedAdminRoute>} />
          <Route path="/superadmin/subscriptions" element={<ProtectedAdminRoute><SuperAdminSubscriptionsPage /></ProtectedAdminRoute>} />
          <Route path="/superadmin/payments" element={<ProtectedAdminRoute><SuperAdminPaymentsPage /></ProtectedAdminRoute>} />
          <Route path="/superadmin/analytics" element={<ProtectedAdminRoute><SuperAdminAnalyticsPage /></ProtectedAdminRoute>} />
          <Route path="/superadmin/settings" element={<ProtectedAdminRoute><SuperAdminSettingsPage /></ProtectedAdminRoute>} />

          {/* Page 404 personnalisée */}
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        </Routes>
          </Suspense>
          <CookieBanner />
          <VercelInsights />
      </BrowserRouter>
      </GeoProvider>
    </AuthProvider>
  );
}
