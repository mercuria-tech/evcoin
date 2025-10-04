import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Zap, Users, CreditCard, BarChart, FileText, Bell, LifeBuoy, Settings, BatteryCharging, Car } from 'lucide-react';
import { cn } from '../../lib/utils';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
  locale: string;
  onLanguageChange: (language: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, locale, onLanguageChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isRTL = ['ar', 'fa'].includes(locale);

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/', key: 'dashboard' },
    { name: 'Stations', icon: Zap, path: '/stations', key: 'stations' },
    { name: 'Users', icon: Users, path: '/users', key: 'users' },
    { name: 'Charging Sessions', icon: BatteryCharging, path: '/charging', key: 'chargingSessions' },
    { name: 'Payments', icon: CreditCard, path: '/payments', key: 'payments' },
    { name: 'Vehicles', icon: Car, path: '/vehicles', key: 'vehicles' },
    { name: 'Analytics', icon: BarChart, path: '/analytics', key: 'analytics' },
    { name: 'Reports', icon: FileText, path: '/reports', key: 'reports' },
    { name: 'Notifications', icon: Bell, path: '/notifications', key: 'notifications' },
    { name: 'Support', icon: LifeBuoy, path: '/support', key: 'support' },
    { name: 'Settings', icon: Settings, path: '/settings', key: 'settings' },
  ];

  // Translation function (in a real app, this would come from i18n)
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        dashboard: 'Dashboard',
        stations: 'Stations',
        users: 'Users',
        chargingSessions: 'Charging Sessions',
        payments: 'Payments',
        vehicles: 'Vehicles',
        analytics: 'Analytics',
        reports: 'Reports',
        notifications: 'Notifications',
        support: 'Support',
        settings: 'Settings',
        evAdmin: 'EV Admin',
        adminDashboard: 'Admin Dashboard'
      },
      ar: {
        dashboard: 'لوحة التحكم',
        stations: 'المحطات',
        users: 'المستخدمون',
        chargingSessions: 'جلسات الشحن',
        payments: 'المدفوعات',
        vehicles: 'المركبات',
        analytics: 'التحليلات',
        reports: 'التقارير',
        notifications: 'الإشعارات',
        support: 'الدعم',
        settings: 'الإعدادات',
        evAdmin: 'إدارة المركبات الكهربائية',
        adminDashboard: 'لوحة تحكم الإدارة'
      },
      fa: {
        dashboard: 'داشبورد',
        stations: 'ایستگاه‌ها',
        users: 'کاربران',
        chargingSessions: 'جلسات شارژ',
        payments: 'پرداخت‌ها',
        vehicles: 'وسایل نقلیه',
        analytics: 'تحلیل‌ها',
        reports: 'گزارش‌ها',
        notifications: 'اطلاعیه‌ها',
        support: 'پشتیبانی',
        settings: 'تنظیمات',
        evAdmin: 'مدیریت خودروهای برقی',
        adminDashboard: 'داشبورد مدیریت'
      }
    };
    return translations[locale]?.[key] || key;
  };

  return (
    <div className={cn(
      "flex min-h-screen bg-gray-100 dark:bg-gray-900",
      isRTL && "rtl"
    )}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col bg-white dark:bg-gray-800 shadow-lg transition-all duration-300",
          isRTL ? "right-0" : "left-0",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center justify-between h-16 border-b dark:border-gray-700 px-6">
          <h1 className={cn(
            "text-2xl font-bold text-gray-900 dark:text-white",
            !isSidebarOpen && "hidden"
          )}>
            {t('evAdmin')}
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
              isSidebarOpen && (isRTL ? "absolute left-4" : "absolute right-4")
            )}
          >
            {/* Icon for toggling sidebar */}
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            )}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center p-3 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
                isRTL ? "flex-row-reverse" : "flex-row"
              )}
            >
              <item.icon className={cn("h-5 w-5", isSidebarOpen ? (isRTL ? "ml-3" : "mr-3") : "mx-auto")} />
              <span className={cn(!isSidebarOpen && "hidden")}>{t(item.key)}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className={cn(
            "flex items-center p-3 rounded-lg bg-gray-50",
            isRTL ? "flex-row-reverse" : "flex-row"
          )}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
            <div className={cn("flex-1 min-w-0", isRTL ? "ml-3" : "ml-3")}>
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@evcharging.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarOpen ? (isRTL ? "mr-64" : "ml-64") : (isRTL ? "mr-20" : "ml-20")
      )}>
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 shadow-md">
          <div className={cn("flex items-center space-x-4", isRTL && "flex-row-reverse space-x-reverse")}>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {t('adminDashboard')}
            </h2>
          </div>

          <div className={cn("flex items-center space-x-4", isRTL && "flex-row-reverse space-x-reverse")}>
            {/* Language Switcher */}
            <LanguageSwitcher
              currentLanguage={locale}
              onLanguageChange={onLanguageChange}
            />
            
            {/* User profile/settings */}
            <div>
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;