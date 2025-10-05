#!/bin/bash

# Script to update all admin pages with comprehensive translation support
# This will add data-i18n attributes and comprehensive JavaScript for all pages

echo "Updating all admin pages with comprehensive translation support..."

# Function to update a page with comprehensive translations
update_page_translations() {
    local file=$1
    local page_name=$2
    
    echo "Updating $file with comprehensive translations..."
    
    # Add comprehensive JavaScript translations before closing </script> tag
    sed -i.bak '/<\/script>/i\
        // Comprehensive translations\
        const comprehensiveTranslations = {\
            en: {\
                "page-title": "'"$page_name"'",\
                "dashboard": "Dashboard",\
                "stations": "Stations",\
                "users": "Users",\
                "charging_sessions": "Charging Sessions",\
                "payments": "Payments",\
                "analytics": "Analytics",\
                "reports": "Reports",\
                "notifications": "Notifications",\
                "support": "Support",\
                "settings": "Settings",\
                "search": "Search",\
                "filter": "Filter",\
                "export": "Export",\
                "add_new": "Add New",\
                "edit": "Edit",\
                "delete": "Delete",\
                "view_details": "View Details",\
                "save": "Save",\
                "cancel": "Cancel",\
                "loading": "Loading",\
                "no_data": "No data available",\
                "active": "Active",\
                "inactive": "Inactive",\
                "pending": "Pending",\
                "completed": "Completed",\
                "cancelled": "Cancelled",\
                "failed": "Failed",\
                "total": "Total",\
                "average": "Average",\
                "status": "Status",\
                "actions": "Actions",\
                "refresh": "Refresh",\
                "download": "Download",\
                "print": "Print",\
                "language": "Language",\
                "english": "English",\
                "arabic": "Arabic",\
                "farsi": "Farsi"\
            },\
            ar: {\
                "page-title": "'"$page_name"'",\
                "dashboard": "لوحة القيادة",\
                "stations": "المحطات",\
                "users": "المستخدمون",\
                "charging_sessions": "جلسات الشحن",\
                "payments": "المدفوعات",\
                "analytics": "التحليلات",\
                "reports": "التقارير",\
                "notifications": "الإشعارات",\
                "support": "الدعم",\
                "settings": "الإعدادات",\
                "search": "بحث",\
                "filter": "تصفية",\
                "export": "تصدير",\
                "add_new": "إضافة جديد",\
                "edit": "تعديل",\
                "delete": "حذف",\
                "view_details": "عرض التفاصيل",\
                "save": "حفظ",\
                "cancel": "إلغاء",\
                "loading": "جاري التحميل",\
                "no_data": "لا توجد بيانات متاحة",\
                "active": "نشط",\
                "inactive": "غير نشط",\
                "pending": "معلق",\
                "completed": "مكتمل",\
                "cancelled": "ملغى",\
                "failed": "فشل",\
                "total": "المجموع",\
                "average": "المتوسط",\
                "status": "الحالة",\
                "actions": "الإجراءات",\
                "refresh": "تحديث",\
                "download": "تحميل",\
                "print": "طباعة",\
                "language": "اللغة",\
                "english": "الإنجليزية",\
                "arabic": "العربية",\
                "farsi": "الفارسية"\
            },\
            fa: {\
                "page-title": "'"$page_name"'",\
                "dashboard": "داشبورد",\
                "stations": "ایستگاه‌ها",\
                "users": "کاربران",\
                "charging_sessions": "جلسات شارژ",\
                "payments": "پرداخت‌ها",\
                "analytics": "تحلیل‌ها",\
                "reports": "گزارش‌ها",\
                "notifications": "اعلان‌ها",\
                "support": "پشتیبانی",\
                "settings": "تنظیمات",\
                "search": "جستجو",\
                "filter": "فیلتر",\
                "export": "خروجی",\
                "add_new": "افزودن جدید",\
                "edit": "ویرایش",\
                "delete": "حذف",\
                "view_details": "مشاهده جزئیات",\
                "save": "ذخیره",\
                "cancel": "لغو",\
                "loading": "در حال بارگذاری",\
                "no_data": "داده‌ای موجود نیست",\
                "active": "فعال",\
                "inactive": "غیرفعال",\
                "pending": "در انتظار",\
                "completed": "تکمیل شده",\
                "cancelled": "لغو شده",\
                "failed": "ناموفق",\
                "total": "کل",\
                "average": "میانگین",\
                "status": "وضعیت",\
                "actions": "عملیات",\
                "refresh": "تازه‌سازی",\
                "download": "دانلود",\
                "print": "چاپ",\
                "language": "زبان",\
                "english": "انگلیسی",\
                "arabic": "عربی",\
                "farsi": "فارسی"\
            }\
        };\
\
        // Enhanced translation function\
        function applyComprehensiveTranslations(language) {\
            currentLanguage = language;\
            \
            // Update document direction and language\
            document.documentElement.dir = [\"ar\", \"fa\"].includes(language) ? \"rtl\" : \"ltr\";\
            document.documentElement.lang = language;\
            \
            // Update all translatable elements\
            const elements = comprehensiveTranslations[language];\
            for (const [id, text] of Object.entries(elements)) {\
                const element = document.getElementById(id);\
                if (element) {\
                    element.textContent = text;\
                }\
                \
                // Also update elements with data-i18n attribute\
                const i18nElements = document.querySelectorAll(`[data-i18n=\"${id}\"]`);\
                i18nElements.forEach(el => {\
                    el.textContent = text;\
                });\
            }\
            \
            // Update language switcher\
            const languageNames = { en: \"English\", ar: \"العربية\", fa: \"فارسی\" };\
            const languageFlags = { en: \"🇺🇸\", ar: \"🇸🇦\", fa: \"🇮🇷\" };\
            \
            if (document.getElementById(\"current-language-name\")) {\
                document.getElementById(\"current-language-name\").textContent = languageNames[language];\
            }\
            if (document.getElementById(\"current-language-flag\")) {\
                document.getElementById(\"current-language-flag\").textContent = languageFlags[language];\
            }\
            \
            // Update checkmarks\
            document.querySelectorAll(\".language-check\").forEach(check => check.classList.add(\"hidden\"));\
            const checkElement = document.getElementById(`check-${language}`);\
            if (checkElement) {\
                checkElement.classList.remove(\"hidden\");\
            }\
            \
            // Save preference\
            localStorage.setItem(\"ev-admin-language\", language);\
        }\
\
        // Override the existing applyLanguage function\
        if (typeof applyLanguage !== \"undefined\") {\
            applyLanguage = applyComprehensiveTranslations;\
        } else {\
            window.applyLanguage = applyComprehensiveTranslations;\
        }\
' "$file"
}

# Update all pages
echo "Updating dashboard.html..."
update_page_translations "apps/admin/dist/dashboard.html" "Dashboard"

echo "Updating stations.html..."
update_page_translations "apps/admin/dist/stations.html" "Station Management"

echo "Updating users.html..."
update_page_translations "apps/admin/dist/users.html" "User Management"

echo "Updating charging.html..."
update_page_translations "apps/admin/dist/charging.html" "Charging Sessions"

echo "Updating payments.html..."
update_page_translations "apps/admin/dist/payments.html" "Payment Management"

echo "Updating analytics.html..."
update_page_translations "apps/admin/dist/analytics.html" "Analytics & Insights"

echo "Updating reports.html..."
update_page_translations "apps/admin/dist/reports.html" "Reports & Analytics"

echo "Updating notifications.html..."
update_page_translations "apps/admin/dist/notifications.html" "Notification Management"

echo "Updating support.html..."
update_page_translations "apps/admin/dist/support.html" "Support Management"

echo "Updating settings.html..."
update_page_translations "apps/admin/dist/settings.html" "Settings"

echo "All pages updated with comprehensive translation support!"
echo "Next step: Deploy and test the translations"

