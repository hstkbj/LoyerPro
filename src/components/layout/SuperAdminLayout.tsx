import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Building,
  CreditCard,
  DollarSign,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Database,
  Tag,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseConfigModal } from '../ui/SupabaseConfigModal';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const adminNav = [
    { label: 'Vue Globale', path: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'Gestion Utilisateurs', path: '/superadmin/users', icon: Users },
    { label: 'Tous les Biens', path: '/superadmin/properties', icon: Building },
    { label: 'Plans & Tarifs', path: '/superadmin/plans', icon: Tag },
    { label: 'Abonnements', path: '/superadmin/subscriptions', icon: CreditCard },
    { label: 'Transactions FedaPay', path: '/superadmin/payments', icon: DollarSign },
    { label: 'Analytique (Google)', path: '/superadmin/analytics', icon: BarChart3 },
    { label: 'Configuration & SQL', path: '/superadmin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 border-r border-slate-300 bg-slate-900 text-white z-30">
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500 text-slate-950">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">SuperAdmin</span>
              <span className="block text-[10px] text-slate-400 font-mono">LoyerPro Core</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setConfigModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-amber-400" />
              <span>Base de données</span>
            </span>
            <span className="text-[10px] text-slate-400">PostgreSQL</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Retour Espace Bailleur</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                Console Admin
              </span>
              <h1 className="text-sm font-semibold text-slate-800">
                {adminNav.find((n) => n.path === location.pathname)?.label || 'Administration'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 hidden sm:inline">{profile?.email}</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Système opérationnel" />
          </div>
        </header>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-900 text-white p-4 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-xs rounded-lg ${
                    isActive ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}
              className="w-full text-left px-3 py-2 text-xs text-slate-400"
            >
              Retour à l'Espace Propriétaire
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <SupabaseConfigModal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} />
    </div>
  );
}
