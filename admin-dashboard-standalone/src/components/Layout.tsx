import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Zap,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
  Settings,
  Menu,
  X,
  Coins
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isRTL = i18n.language === 'ar' || i18n.language === 'fa';

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRTL]);

  const navigation = [
    { name: t('common.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('common.stations'), href: '/stations', icon: Zap },
    { name: t('common.users'), href: '/users', icon: Users },
    { name: t('common.charging_sessions'), href: '/charging', icon: CreditCard },
    { name: t('common.payments'), href: '/payments', icon: CreditCard },
    { name: 'Token Management', href: '/tokens', icon: Coins },
    { name: t('common.analytics'), href: '/analytics', icon: BarChart3 },
    { name: t('common.reports'), href: '/reports', icon: FileText },
    { name: t('common.notifications'), href: '/notifications', icon: Bell },
    { name: t('common.support'), href: '/support', icon: HelpCircle },
    { name: t('common.settings'), href: '/settings', icon: Settings },
  ];

  return (
      <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className={`relative flex w-full max-w-xs flex-1 flex-col bg-sidebar ${isRTL ? 'right-0' : 'left-0'}`}>
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex flex-shrink-0 items-center px-4 py-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('common.admin_dashboard')}
              </h1>
            </div>
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col ${isRTL ? 'lg:right-0' : 'lg:left-0'}`}>
        <div className="flex min-h-0 flex-1 flex-col bg-sidebar border-r border-sidebar-border">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                  <h1 className="text-xl font-bold text-sidebar-foreground">
                    EV Charging Platform
                  </h1>
                </div>
                <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon className={`${isRTL ? 'ml-3' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`}>
        {/* Top navigation */}
            <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-card border-b border-border">
          <button
            type="button"
            className="border-r border-border px-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                      <h2 className="text-lg font-semibold text-foreground">
                    {navigation.find(item => item.href === location.pathname)?.name || t('common.dashboard')}
                  </h2>
                </div>
                <div className="flex items-center space-x-4">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        </div>

            {/* Page content */}
            <main className="flex-1">
              <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-card border-t border-border">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    © 2024 EV Charging Platform. All rights reserved.
                  </div>
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Service
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Support
                    </a>
                  </div>
                </div>
              </div>
            </footer>
      </div>
    </div>
  );
};

export default Layout;
