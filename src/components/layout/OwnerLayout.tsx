import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  FileText,
  CreditCard,
  Receipt,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export function OwnerLayout({ children }: OwnerLayoutProps) {
  const { profile, signOut, isSuperAdmin, isAgency } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mes Biens', path: '/dashboard/properties', icon: Home },
    { label: 'Locataires', path: '/dashboard/tenants', icon: Users },
    { label: 'Contrats', path: '/dashboard/contracts', icon: FileText },
    { label: 'Paiements / Loyers', path: '/dashboard/payments', icon: CreditCard },
    { label: 'Dépenses', path: '/dashboard/expenses', icon: Receipt },
    { label: 'Demandes de Visite', path: '/dashboard/visits', icon: Calendar },
    { label: 'Renseignements', path: '/dashboard/inquiries', icon: MessageSquare },
    { label: 'Rapports & Bilans', path: '/dashboard/reports', icon: BarChart3 },
    { label: 'Paramètres & Forfait', path: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 border-r border-slate-200 bg-white z-30">
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">
                Loyer<span className="text-emerald-600">Pro</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {isAgency ? 'Espace Agence' : 'Espace Bailleur'}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Superadmin link if authorized */}
          {isSuperAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link
                to="/superadmin/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
              >
                <ShieldAlert className="h-4 w-4 text-amber-700" />
                <span>Console SuperAdmin</span>
              </Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="p-3 border-t border-slate-200 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            <span>Voir le site public</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          {/* User Profile Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 uppercase">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {profile?.full_name || 'Utilisateur'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-sm font-semibold text-slate-800">
              {navItems.find((n) => n.path === location.pathname)?.label || 'Espace Gestion'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/dashboard/properties/create')}
              className="text-xs h-8"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              <span>Nouveau bien</span>
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">{profile?.email}</span>
              <button onClick={handleLogout} className="text-rose-600 font-medium">
                Déconnexion
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
