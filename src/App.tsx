import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GeoProvider } from './contexts/GeoContext';
import { trackPageView } from './lib/gtag';

// Layouts
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { OwnerLayout } from './components/layout/OwnerLayout';
import { SuperAdminLayout } from './components/layout/SuperAdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { PropertiesPage } from './pages/public/PropertiesPage';
import { PropertyDetailPage } from './pages/public/PropertyDetailPage';
import { PricingPage } from './pages/public/PricingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { PropertiesListPage } from './pages/dashboard/properties/PropertiesListPage';
import { PropertyFormPage } from './pages/dashboard/properties/PropertyFormPage';
import { TenantsListPage } from './pages/dashboard/tenants/TenantsListPage';
import { TenantFormPage } from './pages/dashboard/tenants/TenantFormPage';
import { ContractsListPage } from './pages/dashboard/contracts/ContractsListPage';
import { ContractFormPage } from './pages/dashboard/contracts/ContractFormPage';
import { PaymentsListPage } from './pages/dashboard/payments/PaymentsListPage';
import { PaymentFormPage } from './pages/dashboard/payments/PaymentFormPage';
import { ExpensesListPage } from './pages/dashboard/expenses/ExpensesListPage';
import { ExpenseFormPage } from './pages/dashboard/expenses/ExpenseFormPage';
import { VisitsListPage } from './pages/dashboard/visits/VisitsListPage';
import { InquiriesListPage } from './pages/dashboard/inquiries/InquiriesListPage';
import { FinancialReportsPage } from './pages/dashboard/reports/FinancialReportsPage';
import { SettingsPage } from './pages/dashboard/settings/SettingsPage';

// SuperAdmin Pages
import { SuperAdminDashboardPage } from './pages/superadmin/SuperAdminDashboardPage';
import { SuperAdminUsersPage } from './pages/superadmin/SuperAdminUsersPage';
import { SuperAdminPropertiesPage } from './pages/superadmin/SuperAdminPropertiesPage';
import { SuperAdminSubscriptionsPage } from './pages/superadmin/SuperAdminSubscriptionsPage';
import { SuperAdminPaymentsPage } from './pages/superadmin/SuperAdminPaymentsPage';
import { SuperAdminSettingsPage } from './pages/superadmin/SuperAdminSettingsPage';
import { SuperAdminPlansPage } from './pages/superadmin/SuperAdminPlansPage';
import { SuperAdminAnalyticsPage } from './pages/superadmin/SuperAdminAnalyticsPage';

// Envoie un événement page_view à Google Analytics à chaque changement de route
function AnalyticsRouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

// Helper component for public page frame
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

// Protected Route wrapper for Owner/Dashboard
function ProtectedOwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, isSuperAdmin, loading, isSupabaseConfigured } = useAuth();

  if (loading) {
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
          <Routes>
            {/* Public Portal */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/properties" element={<PublicLayout><PropertiesPage /></PublicLayout>} />
            <Route path="/properties/:id" element={<PublicLayout><PropertyDetailPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </GeoProvider>
    </AuthProvider>
  );
}
