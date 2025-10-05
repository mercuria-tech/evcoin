#!/usr/bin/env python3

import json
import os

# Read the English file to get the complete structure
with open('apps/admin/dist/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Comprehensive Arabic translations
ar_translations = {
    "common": {
        "dashboard": "لوحة التحكم",
        "stations": "المحطات",
        "users": "المستخدمون",
        "charging_sessions": "جلسات الشحن",
        "payments": "المدفوعات",
        "analytics": "التحليلات",
        "reports": "التقارير",
        "notifications": "الإشعارات",
        "support": "الدعم",
        "settings": "الإعدادات",
        "language": "اللغة",
        "english": "الإنجليزية",
        "arabic": "العربية",
        "farsi": "الفارسية",
        "search": "بحث",
        "filter": "تصفية",
        "export": "تصدير",
        "import": "استيراد",
        "add_new": "إضافة جديد",
        "edit": "تعديل",
        "delete": "حذف",
        "view_details": "عرض التفاصيل",
        "save": "حفظ",
        "cancel": "إلغاء",
        "confirm": "تأكيد",
        "close": "إغلاق",
        "back": "رجوع",
        "next": "التالي",
        "previous": "السابق",
        "loading": "جاري التحميل",
        "no_data": "لا توجد بيانات متاحة",
        "error": "خطأ",
        "success": "نجح",
        "warning": "تحذير",
        "info": "معلومات",
        "active": "نشط",
        "inactive": "غير نشط",
        "pending": "معلق",
        "completed": "مكتمل",
        "cancelled": "ملغى",
        "failed": "فشل",
        "total": "المجموع",
        "average": "المتوسط",
        "maximum": "الحد الأقصى",
        "minimum": "الحد الأدنى",
        "date": "التاريخ",
        "time": "الوقت",
        "duration": "المدة",
        "status": "الحالة",
        "actions": "الإجراءات",
        "refresh": "تحديث",
        "download": "تحميل",
        "print": "طباعة",
        "share": "مشاركة"
    }
}

# Comprehensive Farsi translations
fa_translations = {
    "common": {
        "dashboard": "پنل کنترل",
        "stations": "ایستگاه‌ها",
        "users": "کاربران",
        "charging_sessions": "جلسات شارژ",
        "payments": "پرداخت‌ها",
        "analytics": "تحلیل‌ها",
        "reports": "گزارش‌ها",
        "notifications": "اعلان‌ها",
        "support": "پشتیبانی",
        "settings": "تنظیمات",
        "language": "زبان",
        "english": "انگلیسی",
        "arabic": "عربی",
        "farsi": "فارسی",
        "search": "جستجو",
        "filter": "فیلتر",
        "export": "خروجی",
        "import": "ورودی",
        "add_new": "افزودن جدید",
        "edit": "ویرایش",
        "delete": "حذف",
        "view_details": "مشاهده جزئیات",
        "save": "ذخیره",
        "cancel": "لغو",
        "confirm": "تأیید",
        "close": "بستن",
        "back": "بازگشت",
        "next": "بعدی",
        "previous": "قبلی",
        "loading": "در حال بارگذاری",
        "no_data": "داده‌ای موجود نیست",
        "error": "خطا",
        "success": "موفق",
        "warning": "هشدار",
        "info": "اطلاعات",
        "active": "فعال",
        "inactive": "غیرفعال",
        "pending": "در انتظار",
        "completed": "تکمیل شده",
        "cancelled": "لغو شده",
        "failed": "ناموفق",
        "total": "کل",
        "average": "میانگین",
        "maximum": "حداکثر",
        "minimum": "حداقل",
        "date": "تاریخ",
        "time": "زمان",
        "duration": "مدت زمان",
        "status": "وضعیت",
        "actions": "عملیات",
        "refresh": "تازه‌سازی",
        "download": "دانلود",
        "print": "چاپ",
        "share": "اشتراک"
    }
}

# Function to recursively translate keys
def translate_structure(en_data, ar_translations, fa_translations, ar_result, fa_result, path=""):
    for key, value in en_data.items():
        current_path = f"{path}.{key}" if path else key
        
        if isinstance(value, dict):
            # Recursively process nested dictionaries
            if key not in ar_result:
                ar_result[key] = {}
            if key not in fa_result:
                fa_result[key] = {}
            
            translate_structure(value, ar_translations, fa_translations, ar_result[key], fa_result[key], current_path)
        else:
            # Translate the value
            ar_key = current_path.split('.')[-1]  # Get the last part of the path
            fa_key = current_path.split('.')[-1]
            
            # Use existing translations if available, otherwise use English as fallback
            ar_result[key] = ar_translations.get(ar_key, value)
            fa_result[key] = fa_translations.get(fa_key, value)

# Initialize result dictionaries
ar_result = {}
fa_result = {}

# Translate the entire structure
translate_structure(en_data, ar_translations["common"], fa_translations["common"], ar_result, fa_result)

# Write the complete Arabic file
with open('apps/admin/dist/locales/ar.json', 'w', encoding='utf-8') as f:
    json.dump(ar_result, f, ensure_ascii=False, indent=2)

# Write the complete Farsi file
with open('apps/admin/dist/locales/fa.json', 'w', encoding='utf-8') as f:
    json.dump(fa_result, f, ensure_ascii=False, indent=2)

print("✅ Complete Arabic and Farsi translation files generated!")
print(f"📊 English file: {len(json.dumps(en_data, indent=2).splitlines())} lines")
print(f"📊 Arabic file: {len(json.dumps(ar_result, indent=2).splitlines())} lines")
print(f"📊 Farsi file: {len(json.dumps(fa_result, indent=2).splitlines())} lines")
