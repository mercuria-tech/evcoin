#!/usr/bin/env python3

import os
import re
import json

def add_comprehensive_data_i18n_attributes(file_path):
    """Add comprehensive data-i18n attributes to all translatable elements"""
    print(f"Adding comprehensive data-i18n attributes to {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the title to determine the page name
    title_match = re.search(r'<title>EV Charging Platform - ([^<]+)</title>', content)
    page_name = title_match.group(1) if title_match else "Admin Dashboard"
    
    # Comprehensive replacements for all translatable text
    replacements = [
        # Navigation items
        (r'<span id="nav-dashboard">Dashboard</span>', '<span id="nav-dashboard" data-i18n="dashboard">Dashboard</span>'),
        (r'<span id="nav-stations">Stations</span>', '<span id="nav-stations" data-i18n="stations">Stations</span>'),
        (r'<span id="nav-users">Users</span>', '<span id="nav-users" data-i18n="users">Users</span>'),
        (r'<span id="nav-charging">Charging Sessions</span>', '<span id="nav-charging" data-i18n="charging_sessions">Charging Sessions</span>'),
        (r'<span id="nav-payments">Payments</span>', '<span id="nav-payments" data-i18n="payments">Payments</span>'),
        (r'<span id="nav-analytics">Analytics</span>', '<span id="nav-analytics" data-i18n="analytics">Analytics</span>'),
        (r'<span id="nav-reports">Reports</span>', '<span id="nav-reports" data-i18n="reports">Reports</span>'),
        (r'<span id="nav-notifications">Notifications</span>', '<span id="nav-notifications" data-i18n="notifications">Notifications</span>'),
        (r'<span id="nav-support">Support</span>', '<span id="nav-support" data-i18n="support">Support</span>'),
        (r'<span id="nav-settings">Settings</span>', '<span id="nav-settings" data-i18n="settings">Settings</span>'),
        
        # Logo and titles
        (r'<p class="text-xs text-gray-500" id="logo-subtitle">Admin Dashboard</p>', '<p class="text-xs text-gray-500" id="logo-subtitle" data-i18n="admin_dashboard">Admin Dashboard</p>'),
        
        # Page titles
        (r'<h2[^>]*id="page-title"[^>]*>([^<]+)</h2>', f'<h2 class="text-xl font-semibold text-gray-900" id="page-title" data-i18n="page-title">{page_name}</h2>'),
        
        # Buttons and actions
        (r'>Filter</button>', '><span data-i18n="filter">Filter</span></button>'),
        (r'>Export</button>', '><span data-i18n="export">Export</span></button>'),
        (r'>Add Station</button>', '><span data-i18n="add_station">Add Station</span></button>'),
        (r'>Add User</button>', '><span data-i18n="add_user">Add User</span></button>'),
        (r'>Add Session</button>', '><span data-i18n="add_session">Add Session</span></button>'),
        (r'>Add Payment</button>', '><span data-i18n="add_payment">Add Payment</span></button>'),
        (r'>Add Notification</button>', '><span data-i18n="add_notification">Add Notification</span></button>'),
        (r'>Add Ticket</button>', '><span data-i18n="add_ticket">Add Ticket</span></button>'),
        (r'>Refresh</button>', '><span data-i18n="refresh">Refresh</span></button>'),
        (r'>Download</button>', '><span data-i18n="download">Download</span></button>'),
        (r'>Print</button>', '><span data-i18n="print">Print</span></button>'),
        (r'>Save</button>', '><span data-i18n="save">Save</span></button>'),
        (r'>Cancel</button>', '><span data-i18n="cancel">Cancel</span></button>'),
        (r'>Edit</button>', '><span data-i18n="edit">Edit</span></button>'),
        (r'>Delete</button>', '><span data-i18n="delete">Delete</span></button>'),
        (r'>View Details</button>', '><span data-i18n="view_details">View Details</span></button>'),
        (r'>Configure</button>', '><span data-i18n="configure">Configure</span></button>'),
        (r'>View</button>', '><span data-i18n="view">View</span></button>'),
        
        # Table headers
        (r'<th[^>]*>Station ID</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="station_id">Station ID</th>'),
        (r'<th[^>]*>Name</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="name">Name</th>'),
        (r'<th[^>]*>Location</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="location">Location</th>'),
        (r'<th[^>]*>Connectors</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="connectors">Connectors</th>'),
        (r'<th[^>]*>Usage</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="usage">Usage</th>'),
        (r'<th[^>]*>Status</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="status">Status</th>'),
        (r'<th[^>]*>Actions</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="actions">Actions</th>'),
        (r'<th[^>]*>User ID</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="user_id">User ID</th>'),
        (r'<th[^>]*>Email</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="email">Email</th>'),
        (r'<th[^>]*>Phone</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="phone">Phone</th>'),
        (r'<th[^>]*>Session ID</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="session_id">Session ID</th>'),
        (r'<th[^>]*>Start Time</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="start_time">Start Time</th>'),
        (r'<th[^>]*>End Time</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="end_time">End Time</th>'),
        (r'<th[^>]*>Duration</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="duration">Duration</th>'),
        (r'<th[^>]*>Energy</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="energy">Energy</th>'),
        (r'<th[^>]*>Cost</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="cost">Cost</th>'),
        (r'<th[^>]*>Transaction ID</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="transaction_id">Transaction ID</th>'),
        (r'<th[^>]*>Amount</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="amount">Amount</th>'),
        (r'<th[^>]*>Payment Method</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="payment_method">Payment Method</th>'),
        (r'<th[^>]*>Created At</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="created_at">Created At</th>'),
        
        # Status labels
        (r'>Online</span>', '><span data-i18n="online">Online</span></span>'),
        (r'>Offline</span>', '><span data-i18n="offline">Offline</span></span>'),
        (r'>Maintenance</span>', '><span data-i18n="maintenance">Maintenance</span></span>'),
        (r'>Active</span>', '><span data-i18n="active">Active</span></span>'),
        (r'>Inactive</span>', '><span data-i18n="inactive">Inactive</span></span>'),
        (r'>Pending</span>', '><span data-i18n="pending">Pending</span></span>'),
        (r'>Completed</span>', '><span data-i18n="completed">Completed</span></span>'),
        (r'>Cancelled</span>', '><span data-i18n="cancelled">Cancelled</span></span>'),
        (r'>Failed</span>', '><span data-i18n="failed">Failed</span></span>'),
        
        # Card titles and descriptions
        (r'<h3[^>]*>Total Stations</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="total_stations">Total Stations</h3>'),
        (r'<h3[^>]*>Active Stations</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="active_stations">Active Stations</h3>'),
        (r'<h3[^>]*>Offline Stations</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="offline_stations">Offline Stations</h3>'),
        (r'<h3[^>]*>Maintenance</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="maintenance">Maintenance</h3>'),
        (r'<h3[^>]*>Total Users</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="total_users">Total Users</h3>'),
        (r'<h3[^>]*>Active Users</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="active_users">Active Users</h3>'),
        (r'<h3[^>]*>Total Sessions</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="total_sessions">Total Sessions</h3>'),
        (r'<h3[^>]*>Active Sessions</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="active_sessions">Active Sessions</h3>'),
        (r'<h3[^>]*>Total Revenue</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="total_revenue">Total Revenue</h3>'),
        (r'<h3[^>]*>Monthly Revenue</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="monthly_revenue">Monthly Revenue</h3>'),
        
        # Search and filter placeholders
        (r'placeholder="Search station"', 'placeholder="Search station" data-i18n-placeholder="search_station"'),
        (r'placeholder="Search users"', 'placeholder="Search users" data-i18n-placeholder="search_users"'),
        (r'placeholder="Search sessions"', 'placeholder="Search sessions" data-i18n-placeholder="search_sessions"'),
        (r'placeholder="Search payments"', 'placeholder="Search payments" data-i18n-placeholder="search_payments"'),
        
        # Pagination
        (r'>Next</button>', '><span data-i18n="next">Next</span></button>'),
        (r'>Previous</button>', '><span data-i18n="previous">Previous</span></button>'),
        (r'>Showing</span>', '><span data-i18n="showing">Showing</span></span>'),
        (r'>of</span>', '><span data-i18n="of">of</span></span>'),
        (r'>stations</span>', '><span data-i18n="stations">stations</span></span>'),
        (r'>users</span>', '><span data-i18n="users">users</span></span>'),
        (r'>sessions</span>', '><span data-i18n="sessions">sessions</span></span>'),
        (r'>payments</span>', '><span data-i18n="payments">payments</span></span>'),
    ]
    
    # Apply all replacements
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    # Create comprehensive translations for each page
    translations = {
        'en': {
            'page-title': page_name,
            'admin_dashboard': 'Admin Dashboard',
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
            'add_station': 'Add Station',
            'add_user': 'Add User',
            'add_session': 'Add Session',
            'add_payment': 'Add Payment',
            'add_notification': 'Add Notification',
            'add_ticket': 'Add Ticket',
            'edit': 'Edit',
            'delete': 'Delete',
            'view_details': 'View Details',
            'configure': 'Configure',
            'view': 'View',
            'save': 'Save',
            'cancel': 'Cancel',
            'loading': 'Loading',
            'no_data': 'No data available',
            'active': 'Active',
            'inactive': 'Inactive',
            'online': 'Online',
            'offline': 'Offline',
            'maintenance': 'Maintenance',
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
            'next': 'Next',
            'previous': 'Previous',
            'showing': 'Showing',
            'of': 'of',
            'language': 'Language',
            'english': 'English',
            'arabic': 'Arabic',
            'farsi': 'Farsi',
            'station_id': 'Station ID',
            'name': 'Name',
            'location': 'Location',
            'connectors': 'Connectors',
            'usage': 'Usage',
            'user_id': 'User ID',
            'email': 'Email',
            'phone': 'Phone',
            'session_id': 'Session ID',
            'start_time': 'Start Time',
            'end_time': 'End Time',
            'duration': 'Duration',
            'energy': 'Energy',
            'cost': 'Cost',
            'transaction_id': 'Transaction ID',
            'amount': 'Amount',
            'payment_method': 'Payment Method',
            'created_at': 'Created At',
            'total_stations': 'Total Stations',
            'active_stations': 'Active Stations',
            'offline_stations': 'Offline Stations',
            'total_users': 'Total Users',
            'active_users': 'Active Users',
            'total_sessions': 'Total Sessions',
            'active_sessions': 'Active Sessions',
            'total_revenue': 'Total Revenue',
            'monthly_revenue': 'Monthly Revenue',
            'search_station': 'Search station',
            'search_users': 'Search users',
            'search_sessions': 'Search sessions',
            'search_payments': 'Search payments'
        },
        'ar': {
            'page-title': page_name,
            'admin_dashboard': 'لوحة التحكم الإدارية',
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
            'add_station': 'إضافة محطة',
            'add_user': 'إضافة مستخدم',
            'add_session': 'إضافة جلسة',
            'add_payment': 'إضافة دفعة',
            'add_notification': 'إضافة إشعار',
            'add_ticket': 'إضافة تذكرة',
            'edit': 'تعديل',
            'delete': 'حذف',
            'view_details': 'عرض التفاصيل',
            'configure': 'تكوين',
            'view': 'عرض',
            'save': 'حفظ',
            'cancel': 'إلغاء',
            'loading': 'جاري التحميل',
            'no_data': 'لا توجد بيانات متاحة',
            'active': 'نشط',
            'inactive': 'غير نشط',
            'online': 'متصل',
            'offline': 'غير متصل',
            'maintenance': 'صيانة',
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
            'next': 'التالي',
            'previous': 'السابق',
            'showing': 'عرض',
            'of': 'من',
            'language': 'اللغة',
            'english': 'الإنجليزية',
            'arabic': 'العربية',
            'farsi': 'الفارسية',
            'station_id': 'معرف المحطة',
            'name': 'الاسم',
            'location': 'الموقع',
            'connectors': 'الموصلات',
            'usage': 'الاستخدام',
            'user_id': 'معرف المستخدم',
            'email': 'البريد الإلكتروني',
            'phone': 'الهاتف',
            'session_id': 'معرف الجلسة',
            'start_time': 'وقت البدء',
            'end_time': 'وقت الانتهاء',
            'duration': 'المدة',
            'energy': 'الطاقة',
            'cost': 'التكلفة',
            'transaction_id': 'معرف المعاملة',
            'amount': 'المبلغ',
            'payment_method': 'طريقة الدفع',
            'created_at': 'تاريخ الإنشاء',
            'total_stations': 'إجمالي المحطات',
            'active_stations': 'المحطات النشطة',
            'offline_stations': 'المحطات غير المتصلة',
            'total_users': 'إجمالي المستخدمين',
            'active_users': 'المستخدمون النشطون',
            'total_sessions': 'إجمالي الجلسات',
            'active_sessions': 'الجلسات النشطة',
            'total_revenue': 'إجمالي الإيرادات',
            'monthly_revenue': 'الإيرادات الشهرية',
            'search_station': 'البحث عن المحطة',
            'search_users': 'البحث عن المستخدمين',
            'search_sessions': 'البحث عن الجلسات',
            'search_payments': 'البحث عن المدفوعات'
        },
        'fa': {
            'page-title': page_name,
            'admin_dashboard': 'پنل مدیریت',
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
            'add_station': 'افزودن ایستگاه',
            'add_user': 'افزودن کاربر',
            'add_session': 'افزودن جلسه',
            'add_payment': 'افزودن پرداخت',
            'add_notification': 'افزودن اعلان',
            'add_ticket': 'افزودن تیکت',
            'edit': 'ویرایش',
            'delete': 'حذف',
            'view_details': 'مشاهده جزئیات',
            'configure': 'پیکربندی',
            'view': 'مشاهده',
            'save': 'ذخیره',
            'cancel': 'لغو',
            'loading': 'در حال بارگذاری',
            'no_data': 'داده‌ای موجود نیست',
            'active': 'فعال',
            'inactive': 'غیرفعال',
            'online': 'آنلاین',
            'offline': 'آفلاین',
            'maintenance': 'نگهداری',
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
            'next': 'بعدی',
            'previous': 'قبلی',
            'showing': 'نمایش',
            'of': 'از',
            'language': 'زبان',
            'english': 'انگلیسی',
            'arabic': 'عربی',
            'farsi': 'فارسی',
            'station_id': 'شناسه ایستگاه',
            'name': 'نام',
            'location': 'موقعیت',
            'connectors': 'کانکتورها',
            'usage': 'استفاده',
            'user_id': 'شناسه کاربر',
            'email': 'ایمیل',
            'phone': 'تلفن',
            'session_id': 'شناسه جلسه',
            'start_time': 'زمان شروع',
            'end_time': 'زمان پایان',
            'duration': 'مدت',
            'energy': 'انرژی',
            'cost': 'هزینه',
            'transaction_id': 'شناسه تراکنش',
            'amount': 'مبلغ',
            'payment_method': 'روش پرداخت',
            'created_at': 'تاریخ ایجاد',
            'total_stations': 'کل ایستگاه‌ها',
            'active_stations': 'ایستگاه‌های فعال',
            'offline_stations': 'ایستگاه‌های آفلاین',
            'total_users': 'کل کاربران',
            'active_users': 'کاربران فعال',
            'total_sessions': 'کل جلسات',
            'active_sessions': 'جلسات فعال',
            'total_revenue': 'کل درآمد',
            'monthly_revenue': 'درآمد ماهانه',
            'search_station': 'جستجوی ایستگاه',
            'search_users': 'جستجوی کاربران',
            'search_sessions': 'جستجوی جلسات',
            'search_payments': 'جستجوی پرداخت‌ها'
        }
    }
    
    # Extract the page-specific content between <body> and </body>
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
    if not body_match:
        print(f"Could not find body content in {file_path}")
        return
    
    body_content = body_match.group(1)
    
    # Create the complete HTML with comprehensive translations
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
        
        // COMPREHENSIVE TRANSLATIONS - ALL LANGUAGES AND ALL ELEMENTS
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

        // Apply language changes - COMPREHENSIVE FUNCTION
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
    
    print(f"✅ Added comprehensive data-i18n attributes to {file_path}")

# Fix all HTML files with comprehensive data-i18n attributes
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
        add_comprehensive_data_i18n_attributes(file_path)
    else:
        print(f"File not found: {file_path}")

print("✅ ALL HTML FILES FIXED WITH COMPREHENSIVE DATA-I18N ATTRIBUTES!")
