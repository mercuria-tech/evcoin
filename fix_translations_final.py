#!/usr/bin/env python3

import os
import re
import json

def fix_html_with_data_attributes(file_path):
    """Fix HTML file by adding data-i18n attributes and working translations"""
    print(f"Fixing {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the title to determine the page name
    title_match = re.search(r'<title>EV Charging Platform - ([^<]+)</title>', content)
    page_name = title_match.group(1) if title_match else "Admin Dashboard"
    
    # Extract the page-specific content between <body> and </body>
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
    if not body_match:
        print(f"Could not find body content in {file_path}")
        return
    
    body_content = body_match.group(1)
    
    # Add data-i18n attributes to key elements
    # This is the critical fix - we need to add translation keys to elements
    
    # Replace common text patterns with data-i18n attributes
    replacements = [
        # Navigation items
        (r'<a[^>]*>Dashboard</a>', lambda m: m.group(0).replace('Dashboard', '<span data-i18n="dashboard">Dashboard</span>')),
        (r'<a[^>]*>Stations</a>', lambda m: m.group(0).replace('Stations', '<span data-i18n="stations">Stations</span>')),
        (r'<a[^>]*>Users</a>', lambda m: m.group(0).replace('Users', '<span data-i18n="users">Users</span>')),
        (r'<a[^>]*>Charging Sessions</a>', lambda m: m.group(0).replace('Charging Sessions', '<span data-i18n="charging_sessions">Charging Sessions</span>')),
        (r'<a[^>]*>Payments</a>', lambda m: m.group(0).replace('Payments', '<span data-i18n="payments">Payments</span>')),
        (r'<a[^>]*>Analytics</a>', lambda m: m.group(0).replace('Analytics', '<span data-i18n="analytics">Analytics</span>')),
        (r'<a[^>]*>Reports</a>', lambda m: m.group(0).replace('Reports', '<span data-i18n="reports">Reports</span>')),
        (r'<a[^>]*>Notifications</a>', lambda m: m.group(0).replace('Notifications', '<span data-i18n="notifications">Notifications</span>')),
        (r'<a[^>]*>Support</a>', lambda m: m.group(0).replace('Support', '<span data-i18n="support">Support</span>')),
        (r'<a[^>]*>Settings</a>', lambda m: m.group(0).replace('Settings', '<span data-i18n="settings">Settings</span>')),
        
        # Page titles
        (r'<h2[^>]*id="page-title"[^>]*>([^<]+)</h2>', lambda m: f'<h2 class="text-xl font-semibold text-gray-900" id="page-title" data-i18n="page-title">{m.group(1)}</h2>'),
        
        # Common buttons
        (r'Export</button>', 'Export</button>'.replace('Export', '<span data-i18n="export">Export</span>')),
        (r'Add New</button>', 'Add New</button>'.replace('Add New', '<span data-i18n="add_new">Add New</span>')),
        (r'Search</button>', 'Search</button>'.replace('Search', '<span data-i18n="search">Search</span>')),
        (r'Filter</button>', 'Filter</button>'.replace('Filter', '<span data-i18n="filter">Filter</span>')),
        (r'Refresh</button>', 'Refresh</button>'.replace('Refresh', '<span data-i18n="refresh">Refresh</span>')),
        (r'Download</button>', 'Download</button>'.replace('Download', '<span data-i18n="download">Download</span>')),
        (r'Print</button>', 'Print</button>'.replace('Print', '<span data-i18n="print">Print</span>')),
        (r'Save</button>', 'Save</button>'.replace('Save', '<span data-i18n="save">Save</span>')),
        (r'Cancel</button>', 'Cancel</button>'.replace('Cancel', '<span data-i18n="cancel">Cancel</span>')),
        (r'Edit</button>', 'Edit</button>'.replace('Edit', '<span data-i18n="edit">Edit</span>')),
        (r'Delete</button>', 'Delete</button>'.replace('Delete', '<span data-i18n="delete">Delete</span>')),
        (r'View Details</button>', 'View Details</button>'.replace('View Details', '<span data-i18n="view_details">View Details</span>')),
        
        # Status labels
        (r'>Active<', '><span data-i18n="active">Active</span><'),
        (r'>Inactive<', '><span data-i18n="inactive">Inactive</span><'),
        (r'>Pending<', '><span data-i18n="pending">Pending</span><'),
        (r'>Completed<', '><span data-i18n="completed">Completed</span><'),
        (r'>Cancelled<', '><span data-i18n="cancelled">Cancelled</span><'),
        (r'>Failed<', '><span data-i18n="failed">Failed</span><'),
        
        # Table headers
        (r'>Status<', '><span data-i18n="status">Status</span><'),
        (r'>Actions<', '><span data-i18n="actions">Actions</span><'),
        (r'>Total<', '><span data-i18n="total">Total</span><'),
        (r'>Average<', '><span data-i18n="average">Average</span><'),
    ]
    
    # Apply replacements
    for pattern, replacement in replacements:
        if callable(replacement):
            body_content = re.sub(pattern, replacement, body_content)
        else:
            body_content = body_content.replace(pattern, replacement)
    
    # Create comprehensive translations
    translations = {
        'en': {
            'page-title': page_name,
            'dashboard': 'Dashboard',
            'stations': 'Stations',
            'users': 'Users',
            'charging_sessions': 'Charging Sessions',
            'payments': 'Payments',
            'analytics': 'Analytics',
            'reports': 'Reports',
            'notifications': 'Notifications',
            'support': 'Support',
            'settings': 'Settings',
            'search': 'Search',
            'filter': 'Filter',
            'export': 'Export',
            'add_new': 'Add New',
            'edit': 'Edit',
            'delete': 'Delete',
            'view_details': 'View Details',
            'save': 'Save',
            'cancel': 'Cancel',
            'loading': 'Loading',
            'no_data': 'No data available',
            'active': 'Active',
            'inactive': 'Inactive',
            'pending': 'Pending',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'failed': 'Failed',
            'total': 'Total',
            'average': 'Average',
            'status': 'Status',
            'actions': 'Actions',
            'refresh': 'Refresh',
            'download': 'Download',
            'print': 'Print',
            'language': 'Language',
            'english': 'English',
            'arabic': 'Arabic',
            'farsi': 'Farsi'
        },
        'ar': {
            'page-title': page_name,
            'dashboard': 'لوحة التحكم',
            'stations': 'المحطات',
            'users': 'المستخدمون',
            'charging_sessions': 'جلسات الشحن',
            'payments': 'المدفوعات',
            'analytics': 'التحليلات',
            'reports': 'التقارير',
            'notifications': 'الإشعارات',
            'support': 'الدعم',
            'settings': 'الإعدادات',
            'search': 'بحث',
            'filter': 'تصفية',
            'export': 'تصدير',
            'add_new': 'إضافة جديد',
            'edit': 'تعديل',
            'delete': 'حذف',
            'view_details': 'عرض التفاصيل',
            'save': 'حفظ',
            'cancel': 'إلغاء',
            'loading': 'جاري التحميل',
            'no_data': 'لا توجد بيانات متاحة',
            'active': 'نشط',
            'inactive': 'غير نشط',
            'pending': 'معلق',
            'completed': 'مكتمل',
            'cancelled': 'ملغى',
            'failed': 'فشل',
            'total': 'المجموع',
            'average': 'المتوسط',
            'status': 'الحالة',
            'actions': 'الإجراءات',
            'refresh': 'تحديث',
            'download': 'تحميل',
            'print': 'طباعة',
            'language': 'اللغة',
            'english': 'الإنجليزية',
            'arabic': 'العربية',
            'farsi': 'الفارسية'
        },
        'fa': {
            'page-title': page_name,
            'dashboard': 'پنل کنترل',
            'stations': 'ایستگاه‌ها',
            'users': 'کاربران',
            'charging_sessions': 'جلسات شارژ',
            'payments': 'پرداخت‌ها',
            'analytics': 'تحلیل‌ها',
            'reports': 'گزارش‌ها',
            'notifications': 'اعلان‌ها',
            'support': 'پشتیبانی',
            'settings': 'تنظیمات',
            'search': 'جستجو',
            'filter': 'فیلتر',
            'export': 'خروجی',
            'add_new': 'افزودن جدید',
            'edit': 'ویرایش',
            'delete': 'حذف',
            'view_details': 'مشاهده جزئیات',
            'save': 'ذخیره',
            'cancel': 'لغو',
            'loading': 'در حال بارگذاری',
            'no_data': 'داده‌ای موجود نیست',
            'active': 'فعال',
            'inactive': 'غیرفعال',
            'pending': 'در انتظار',
            'completed': 'تکمیل شده',
            'cancelled': 'لغو شده',
            'failed': 'ناموفق',
            'total': 'کل',
            'average': 'میانگین',
            'status': 'وضعیت',
            'actions': 'عملیات',
            'refresh': 'تازه‌سازی',
            'download': 'دانلود',
            'print': 'چاپ',
            'language': 'زبان',
            'english': 'انگلیسی',
            'arabic': 'عربی',
            'farsi': 'فارسی'
        }
    }
    
    # Create the complete HTML with working translations
    clean_html = f'''<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EV Charging Platform - {page_name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {{
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --primary: 221.2 83.2% 53.3%;
            --primary-foreground: 210 40% 98%;
            --secondary: 210 40% 96%;
            --secondary-foreground: 222.2 84% 4.9%;
            --muted: 210 40% 96%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --border: 214.3 31.8% 91.4%;
        }}
        
        .card {{
            background-color: hsl(var(--card));
            color: hsl(var(--card-foreground));
            border: 1px solid hsl(var(--border));
        }}
        
        .btn-primary {{
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
        }}
        
        .btn-secondary {{
            background-color: hsl(var(--secondary));
            color: hsl(var(--secondary-foreground));
        }}
        
        .hover-lift {{
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }}
        
        .hover-lift:hover {{
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }}

        /* RTL Support */
        [dir="rtl"] {{
            direction: rtl;
        }}

        [dir="rtl"] .ml-auto {{
            margin-left: auto;
            margin-right: 0;
        }}

        [dir="rtl"] .mr-auto {{
            margin-right: auto;
            margin-left: 0;
        }}

        [dir="rtl"] .ml-2 {{
            margin-left: 0.5rem;
            margin-right: 0;
        }}

        [dir="rtl"] .mr-2 {{
            margin-right: 0.5rem;
            margin-left: 0;
        }}

        [dir="rtl"] .ml-3 {{
            margin-left: 0.75rem;
            margin-right: 0;
        }}

        [dir="rtl"] .mr-3 {{
            margin-right: 0.75rem;
            margin-left: 0;
        }}

        [dir="rtl"] .ml-4 {{
            margin-left: 1rem;
            margin-right: 0;
        }}

        [dir="rtl"] .mr-4 {{
            margin-right: 1rem;
            margin-left: 0;
        }}

        [dir="rtl"] .ml-6 {{
            margin-left: 1.5rem;
            margin-right: 0;
        }}

        [dir="rtl"] .mr-6 {{
            margin-right: 1.5rem;
            margin-left: 0;
        }}

        [dir="rtl"] .pl-2 {{
            padding-left: 0.5rem;
            padding-right: 0;
        }}

        [dir="rtl"] .pr-2 {{
            padding-right: 0.5rem;
            padding-left: 0;
        }}

        [dir="rtl"] .pl-3 {{
            padding-left: 0.75rem;
            padding-right: 0;
        }}

        [dir="rtl"] .pr-3 {{
            padding-right: 0.75rem;
            padding-left: 0;
        }}

        [dir="rtl"] .pl-4 {{
            padding-left: 1rem;
            padding-right: 0;
        }}

        [dir="rtl"] .pr-4 {{
            padding-right: 1rem;
            padding-left: 0;
        }}

        [dir="rtl"] .pl-6 {{
            padding-left: 1.5rem;
            padding-right: 0;
        }}

        [dir="rtl"] .pr-6 {{
            padding-right: 1.5rem;
            padding-left: 0;
        }}

        [dir="rtl"] .left-0 {{
            left: auto;
            right: 0;
        }}

        [dir="rtl"] .right-0 {{
            right: auto;
            left: 0;
        }}

        [dir="rtl"] .left-3 {{
            left: auto;
            right: 0.75rem;
        }}

        [dir="rtl"] .right-3 {{
            right: auto;
            left: 0.75rem;
        }}

        [dir="rtl"] .left-4 {{
            left: auto;
            right: 1rem;
        }}

        [dir="rtl"] .right-4 {{
            right: auto;
            left: 1rem;
        }}

        [dir="rtl"] .text-left {{
            text-align: right;
        }}

        [dir="rtl"] .text-right {{
            text-align: left;
        }}

        [dir="rtl"] .flex-row {{
            flex-direction: row-reverse;
        }}

        [dir="rtl"] .flex-row-reverse {{
            flex-direction: row;
        }}

        [dir="rtl"] .border-l {{
            border-left: none;
            border-right: 1px solid;
        }}

        [dir="rtl"] .border-r {{
            border-right: none;
            border-left: 1px solid;
        }}

        [dir="rtl"] .border-l-4 {{
            border-left: none;
            border-right: 4px solid;
        }}

        [dir="rtl"] .border-r-4 {{
            border-right: none;
            border-left: 4px solid;
        }}

        [dir="rtl"] .rounded-l {{
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-top-right-radius: 0.25rem;
            border-bottom-right-radius: 0.25rem;
        }}

        [dir="rtl"] .rounded-r {{
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-top-left-radius: 0.25rem;
            border-bottom-left-radius: 0.25rem;
        }}

        [dir="rtl"] .rounded-l-lg {{
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-top-right-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
        }}

        [dir="rtl"] .rounded-r-lg {{
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-top-left-radius: 0.5rem;
            border-bottom-left-radius: 0.5rem;
        }}

        [dir="rtl"] .space-x-2 > * + * {{
            margin-left: 0;
            margin-right: 0.5rem;
        }}

        [dir="rtl"] .space-x-3 > * + * {{
            margin-left: 0;
            margin-right: 0.75rem;
        }}

        [dir="rtl"] .space-x-4 > * + * {{
            margin-left: 0;
            margin-right: 1rem;
        }}

        [dir="rtl"] .space-x-6 > * + * {{
            margin-left: 0;
            margin-right: 1.5rem;
        }}

        [dir="rtl"] .space-y-2 > * + * {{
            margin-top: 0.5rem;
            margin-bottom: 0;
        }}

        [dir="rtl"] .space-y-3 > * + * {{
            margin-top: 0.75rem;
            margin-bottom: 0;
        }}

        [dir="rtl"] .space-y-4 > * + * {{
            margin-top: 1rem;
            margin-bottom: 0;
        }}

        [dir="rtl"] .space-y-6 > * + * {{
            margin-top: 1.5rem;
            margin-bottom: 0;
        }}

        /* Language Switcher */
        .language-switcher {{
            position: relative;
            display: inline-block;
        }}

        .language-dropdown {{
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 0.5rem;
            width: 12rem;
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 50;
        }}

        [dir="rtl"] .language-dropdown {{
            right: auto;
            left: 0;
        }}

        .language-option {{
            display: flex;
            align-items: center;
            width: 100%;
            padding: 0.5rem 1rem;
            text-align: left;
            font-size: 0.875rem;
            color: #374151;
            border: none;
            background: none;
            cursor: pointer;
            transition: background-color 0.15s ease-in-out;
        }}

        [dir="rtl"] .language-option {{
            text-align: right;
        }}

        .language-option:hover {{
            background-color: #f3f4f6;
        }}

        .language-option.active {{
            background-color: #dbeafe;
            color: #2563eb;
        }}

        .language-flag {{
            font-size: 1.125rem;
            margin-right: 0.75rem;
        }}

        [dir="rtl"] .language-flag {{
            margin-right: 0;
            margin-left: 0.75rem;
        }}

        .language-name {{
            font-weight: 500;
        }}

        .language-check {{
            margin-left: auto;
            color: #2563eb;
        }}

        [dir="rtl"] .language-check {{
            margin-left: 0;
            margin-right: auto;
        }}
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
{body_content}

    <script>
        // Initialize Lucide icons
        lucide.createIcons();
        
        // WORKING TRANSLATIONS - COMPLETE AND INLINE
        const translations = {json.dumps(translations, ensure_ascii=False, indent=8)};
        
        let currentLanguage = 'en';

        // Load saved language preference
        function loadLanguagePreference() {{
            const savedLanguage = localStorage.getItem('ev-admin-language');
            if (savedLanguage && ['en', 'ar', 'fa'].includes(savedLanguage)) {{
                currentLanguage = savedLanguage;
                applyLanguage(currentLanguage);
            }}
        }}

        // Apply language changes - THIS IS THE WORKING FUNCTION
        function applyLanguage(language) {{
            console.log('=== APPLYING LANGUAGE ===', language);
            currentLanguage = language;
            
            // Update document direction and language
            document.documentElement.dir = ['ar', 'fa'].includes(language) ? 'rtl' : 'ltr';
            document.documentElement.lang = language;
            
            // Get translations for current language
            const langData = translations[language];
            if (!langData) {{
                console.error('No translations found for language:', language);
                return;
            }}
            
            console.log('Translation data loaded:', Object.keys(langData).length, 'keys');
            
            // Update ALL elements with data-i18n attributes
            const elements = document.querySelectorAll('[data-i18n]');
            console.log('Found', elements.length, 'elements to translate');
            
            elements.forEach(element => {{
                const key = element.getAttribute('data-i18n');
                if (langData[key]) {{
                    const oldText = element.textContent;
                    element.textContent = langData[key];
                    console.log('✓ Translated:', key, 'from "' + oldText + '" to "' + langData[key] + '"');
                }} else {{
                    console.warn('✗ No translation found for key:', key);
                }}
            }});
            
            // Update input placeholders
            const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
            placeholders.forEach(element => {{
                const key = element.getAttribute('data-i18n-placeholder');
                if (langData[key]) {{
                    element.placeholder = langData[key];
                }}
            }});
            
            // Update language switcher
            const languageNames = {{ en: 'English', ar: 'العربية', fa: 'فارسی' }};
            const languageFlags = {{ en: '🇺🇸', ar: '🇸🇦', fa: '🇮🇷' }};
            
            const nameElement = document.getElementById('current-language-name');
            const flagElement = document.getElementById('current-language-flag');
            
            if (nameElement) {{
                nameElement.textContent = languageNames[language];
            }}
            if (flagElement) {{
                flagElement.textContent = languageFlags[language];
            }}
            
            // Update checkmarks
            document.querySelectorAll('.language-check').forEach(check => check.classList.add('hidden'));
            const checkElement = document.getElementById(`check-${{language}}`);
            if (checkElement) {{
                checkElement.classList.remove('hidden');
            }}
            
            // Save preference
            localStorage.setItem('ev-admin-language', language);
            
            console.log('=== LANGUAGE APPLIED SUCCESSFULLY ===', language);
        }}

        // Toggle language dropdown
        function toggleLanguageDropdown() {{
            const dropdown = document.getElementById('language-dropdown');
            dropdown.classList.toggle('hidden');
        }}

        // Change language
        function changeLanguage(language) {{
            console.log('=== CHANGING LANGUAGE ===', language);
            applyLanguage(language);
            toggleLanguageDropdown();
        }}

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {{
            const dropdown = document.getElementById('language-dropdown');
            const button = event.target.closest('.language-switcher button');
            
            if (!button && !dropdown.contains(event.target)) {{
                dropdown.classList.add('hidden');
            }}
        }});

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {{
            console.log('=== DOM LOADED - INITIALIZING LANGUAGE SYSTEM ===');
            loadLanguagePreference();
        }});
    </script>
</body>
</html>'''
    
    # Write the fixed file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(clean_html)
    
    print(f"✅ Fixed {file_path} with working translations")

# Fix all HTML files with working translations
html_files = [
    'apps/admin/dist/analytics.html',
    'apps/admin/dist/charging.html',
    'apps/admin/dist/dashboard.html',
    'apps/admin/dist/notifications.html',
    'apps/admin/dist/payments.html',
    'apps/admin/dist/reports.html',
    'apps/admin/dist/settings.html',
    'apps/admin/dist/stations.html',
    'apps/admin/dist/support.html',
    'apps/admin/dist/users.html'
]

for file_path in html_files:
    if os.path.exists(file_path):
        fix_html_with_data_attributes(file_path)
    else:
        print(f"File not found: {file_path}")

print("✅ ALL HTML FILES FIXED WITH WORKING TRANSLATIONS!")
