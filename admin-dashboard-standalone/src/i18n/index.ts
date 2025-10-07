import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple translations to avoid import issues
const resources = {
  en: {
    translation: {
      common: {
        dashboard: "Dashboard",
        stations: "Stations",
        users: "Users",
        charging_sessions: "Charging Sessions",
        payments: "Payments",
        analytics: "Analytics",
        reports: "Reports",
        notifications: "Notifications",
        support: "Support",
        settings: "Settings",
        admin_dashboard: "Admin Dashboard",
        loading: "Loading...",
        error: "Error"
      },
      dashboard: {
        title: "Dashboard Overview",
        total_stations: "Total Stations",
        active_sessions: "Active Sessions",
        total_users: "Total Users",
        revenue_today: "Revenue Today",
        system_health: "System Health",
        recent_activity: "Recent Activity",
        quick_stats: "Quick Stats"
      },
      stations: {
        title: "Station Management",
        add_station: "Add Station",
        view_details: "View Details"
      }
    }
  },
  ar: {
    translation: {
      common: {
        dashboard: "لوحة التحكم",
        stations: "المحطات",
        users: "المستخدمون",
        charging_sessions: "جلسات الشحن",
        payments: "المدفوعات",
        analytics: "التحليلات",
        reports: "التقارير",
        notifications: "الإشعارات",
        support: "الدعم",
        settings: "الإعدادات",
        admin_dashboard: "لوحة تحكم الإدارة",
        loading: "جاري التحميل...",
        error: "خطأ"
      },
      dashboard: {
        title: "نظرة عامة على لوحة التحكم",
        total_stations: "إجمالي المحطات",
        active_sessions: "الجلسات النشطة",
        total_users: "إجمالي المستخدمين",
        revenue_today: "الإيرادات اليوم",
        system_health: "صحة النظام",
        recent_activity: "النشاط الأخير",
        quick_stats: "الإحصائيات السريعة"
      },
      stations: {
        title: "إدارة المحطات",
        add_station: "إضافة محطة",
        view_details: "عرض التفاصيل"
      }
    }
  },
  fa: {
    translation: {
      common: {
        dashboard: "داشبورد",
        stations: "ایستگاه‌ها",
        users: "کاربران",
        charging_sessions: "جلسات شارژ",
        payments: "پرداخت‌ها",
        analytics: "تحلیل‌ها",
        reports: "گزارش‌ها",
        notifications: "اطلاعیه‌ها",
        support: "پشتیبانی",
        settings: "تنظیمات",
        admin_dashboard: "داشبورد مدیریت",
        loading: "در حال بارگذاری...",
        error: "خطا"
      },
      dashboard: {
        title: "نمای کلی داشبورد",
        total_stations: "کل ایستگاه‌ها",
        active_sessions: "جلسات فعال",
        total_users: "کل کاربران",
        revenue_today: "درآمد امروز",
        system_health: "سلامت سیستم",
        recent_activity: "فعالیت اخیر",
        quick_stats: "آمار سریع"
      },
      stations: {
        title: "مدیریت ایستگاه‌ها",
        add_station: "افزودن ایستگاه",
        view_details: "مشاهده جزئیات"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;