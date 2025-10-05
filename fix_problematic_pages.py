#!/usr/bin/env python3

import os
import re
import json

def fix_navigation_and_content(file_path):
    """Fix navigation and content elements with proper data-i18n attributes"""
    print(f"Fixing navigation and content in {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the title to determine the page name
    title_match = re.search(r'<title>EV Charging Platform - ([^<]+)</title>', content)
    page_name = title_match.group(1) if title_match else "Admin Dashboard"
    
    # Fix navigation elements - these are the critical missing pieces
    navigation_fixes = [
        # Logo and admin dashboard
        (r'<p class="text-xs text-gray-500">Admin Dashboard</p>', '<p class="text-xs text-gray-500" data-i18n="admin_dashboard">Admin Dashboard</p>'),
        
        # Navigation spans - these are the main problem
        (r'<span>Dashboard</span>', '<span data-i18n="dashboard">Dashboard</span>'),
        (r'<span>Stations</span>', '<span data-i18n="stations">Stations</span>'),
        (r'<span>Users</span>', '<span data-i18n="users">Users</span>'),
        (r'<span>Charging Sessions</span>', '<span data-i18n="charging_sessions">Charging Sessions</span>'),
        (r'<span>Payments</span>', '<span data-i18n="payments">Payments</span>'),
        (r'<span>Analytics</span>', '<span data-i18n="analytics">Analytics</span>'),
        (r'<span>Reports</span>', '<span data-i18n="reports">Reports</span>'),
        (r'<span>Notifications</span>', '<span data-i18n="notifications">Notifications</span>'),
        (r'<span>Support</span>', '<span data-i18n="support">Support</span>'),
        (r'<span>Settings</span>', '<span data-i18n="settings">Settings</span>'),
        
        # Fix nested spans (remove duplicates)
        (r'<span data-i18n="completed"><span data-i18n="completed">Completed</span></span>', '<span data-i18n="completed">Completed</span>'),
        (r'<span data-i18n="pending"><span data-i18n="pending">Pending</span></span>', '<span data-i18n="pending">Pending</span>'),
        (r'<span data-i18n="active"><span data-i18n="active">Active</span></span>', '<span data-i18n="active">Active</span>'),
        (r'<span data-i18n="inactive"><span data-i18n="inactive">Inactive</span></span>', '<span data-i18n="inactive">Inactive</span>'),
        (r'<span data-i18n="online"><span data-i18n="online">Online</span></span>', '<span data-i18n="online">Online</span>'),
        (r'<span data-i18n="offline"><span data-i18n="offline">Offline</span></span>', '<span data-i18n="offline">Offline</span>'),
        (r'<span data-i18n="maintenance"><span data-i18n="maintenance">Maintenance</span></span>', '<span data-i18n="maintenance">Maintenance</span>'),
        
        # Add missing data-i18n attributes to common elements
        (r'>Filter</button>', '><span data-i18n="filter">Filter</span></button>'),
        (r'>Export</button>', '><span data-i18n="export">Export</span></button>'),
        (r'>Add Payment</button>', '><span data-i18n="add_payment">Add Payment</span></button>'),
        (r'>Add Notification</button>', '><span data-i18n="add_notification">Add Notification</span></button>'),
        (r'>Add Ticket</button>', '><span data-i18n="add_ticket">Add Ticket</span></button>'),
        (r'>Generate Report</button>', '><span data-i18n="generate_report">Generate Report</span></button>'),
        (r'>Schedule Report</button>', '><span data-i18n="schedule_report">Schedule Report</span></button>'),
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
        (r'<th[^>]*>User</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="user">User</th>'),
        (r'<th[^>]*>Session</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="session">Session</th>'),
        (r'<th[^>]*>Date</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="date">Date</th>'),
        (r'<th[^>]*>Time</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="time">Time</th>'),
        (r'<th[^>]*>Type</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="type">Type</th>'),
        (r'<th[^>]*>Message</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="message">Message</th>'),
        (r'<th[^>]*>Recipient</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="recipient">Recipient</th>'),
        (r'<th[^>]*>Priority</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="priority">Priority</th>'),
        (r'<th[^>]*>Subject</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="subject">Subject</th>'),
        (r'<th[^>]*>Description</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="description">Description</th>'),
        (r'<th[^>]*>Category</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="category">Category</th>'),
        (r'<th[^>]*>Assigned To</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="assigned_to">Assigned To</th>'),
        
        # Card titles and descriptions
        (r'<h3[^>]*>Pending Refunds</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="pending_refunds">Pending Refunds</h3>'),
        (r'<h3[^>]*>Successful Payments</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="successful_payments">Successful Payments</h3>'),
        (r'<h3[^>]*>Today\'s Revenue</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="todays_revenue">Today\'s Revenue</h3>'),
        (r'<h3[^>]*>Total Revenue</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="total_revenue">Total Revenue</h3>'),
        (r'<h3[^>]*>Payment Methods</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="payment_methods">Payment Methods</h3>'),
        (r'<h3[^>]*>Recent Transactions</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="recent_transactions">Recent Transactions</h3>'),
        (r'<h3[^>]*>Unread Notifications</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="unread_notifications">Unread Notifications</h3>'),
        (r'<h3[^>]*>System Alerts</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="system_alerts">System Alerts</h3>'),
        (r'<h3[^>]*>User Notifications</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="user_notifications">User Notifications</h3>'),
        (r'<h3[^>]*>Open Tickets</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="open_tickets">Open Tickets</h3>'),
        (r'<h3[^>]*>Resolved Tickets</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="resolved_tickets">Resolved Tickets</h3>'),
        (r'<h3[^>]*>General Settings</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="general_settings">General Settings</h3>'),
        (r'<h3[^>]*>System Settings</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="system_settings">System Settings</h3>'),
        (r'<h3[^>]*>User Settings</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="user_settings">User Settings</h3>'),
        (r'<h3[^>]*>Security Settings</h3>', '<h3 class="text-lg font-semibold text-gray-900" data-i18n="security_settings">Security Settings</h3>'),
        
        # Search placeholders
        (r'placeholder="Search payments"', 'placeholder="Search payments" data-i18n-placeholder="search_payments"'),
        (r'placeholder="Search notifications"', 'placeholder="Search notifications" data-i18n-placeholder="search_notifications"'),
        (r'placeholder="Search tickets"', 'placeholder="Search tickets" data-i18n-placeholder="search_tickets"'),
        
        # Pagination
        (r'>Next</button>', '><span data-i18n="next">Next</span></button>'),
        (r'>Previous</button>', '><span data-i18n="previous">Previous</span></button>'),
        (r'>Showing</span>', '><span data-i18n="showing">Showing</span></span>'),
        (r'>of</span>', '><span data-i18n="of">of</span></span>'),
        (r'>payments</span>', '><span data-i18n="payments">payments</span></span>'),
        (r'>notifications</span>', '><span data-i18n="notifications">notifications</span></span>'),
        (r'>tickets</span>', '><span data-i18n="tickets">tickets</span></span>'),
    ]
    
    # Apply all fixes
    for pattern, replacement in navigation_fixes:
        content = re.sub(pattern, replacement, content)
    
    # Create comprehensive translations
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
            'add_payment': 'Add Payment',
            'add_notification': 'Add Notification',
            'add_ticket': 'Add Ticket',
            'generate_report': 'Generate Report',
            'schedule_report': 'Schedule Report',
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
            'transaction_id': 'Transaction ID',
            'amount': 'Amount',
            'payment_method': 'Payment Method',
            'created_at': 'Created At',
            'user': 'User',
            'session': 'Session',
            'date': 'Date',
            'time': 'Time',
            'type': 'Type',
            'message': 'Message',
            'recipient': 'Recipient',
            'priority': 'Priority',
            'subject': 'Subject',
            'description': 'Description',
            'category': 'Category',
            'assigned_to': 'Assigned To',
            'pending_refunds': 'Pending Refunds',
            'successful_payments': 'Successful Payments',
            'todays_revenue': 'Today\'s Revenue',
            'total_revenue': 'Total Revenue',
            'payment_methods': 'Payment Methods',
            'recent_transactions': 'Recent Transactions',
            'unread_notifications': 'Unread Notifications',
            'system_alerts': 'System Alerts',
            'user_notifications': 'User Notifications',
            'open_tickets': 'Open Tickets',
            'resolved_tickets': 'Resolved Tickets',
            'general_settings': 'General Settings',
            'system_settings': 'System Settings',
            'user_settings': 'User Settings',
            'security_settings': 'Security Settings',
            'search_payments': 'Search payments',
            'search_notifications': 'Search notifications',
            'search_tickets': 'Search tickets',
            'payments': 'payments',
            'notifications': 'notifications',
            'tickets': 'tickets'
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
            'add_payment': 'إضافة دفعة',
            'add_notification': 'إضافة إشعار',
            'add_ticket': 'إضافة تذكرة',
            'generate_report': 'إنشاء تقرير',
            'schedule_report': 'جدولة تقرير',
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
            'transaction_id': 'معرف المعاملة',
            'amount': 'المبلغ',
            'payment_method': 'طريقة الدفع',
            'created_at': 'تاريخ الإنشاء',
            'user': 'المستخدم',
            'session': 'الجلسة',
            'date': 'التاريخ',
            'time': 'الوقت',
            'type': 'النوع',
            'message': 'الرسالة',
            'recipient': 'المستقبل',
            'priority': 'الأولوية',
            'subject': 'الموضوع',
            'description': 'الوصف',
            'category': 'الفئة',
            'assigned_to': 'مُعيّن لـ',
            'pending_refunds': 'المبالغ المستردة المعلقة',
            'successful_payments': 'المدفوعات الناجحة',
            'todays_revenue': 'إيرادات اليوم',
            'total_revenue': 'إجمالي الإيرادات',
            'payment_methods': 'طرق الدفع',
            'recent_transactions': 'المعاملات الأخيرة',
            'unread_notifications': 'الإشعارات غير المقروءة',
            'system_alerts': 'تنبيهات النظام',
            'user_notifications': 'إشعارات المستخدم',
            'open_tickets': 'التذاكر المفتوحة',
            'resolved_tickets': 'التذاكر المحلولة',
            'general_settings': 'الإعدادات العامة',
            'system_settings': 'إعدادات النظام',
            'user_settings': 'إعدادات المستخدم',
            'security_settings': 'إعدادات الأمان',
            'search_payments': 'البحث عن المدفوعات',
            'search_notifications': 'البحث عن الإشعارات',
            'search_tickets': 'البحث عن التذاكر',
            'payments': 'مدفوعات',
            'notifications': 'إشعارات',
            'tickets': 'تذاكر'
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
            'add_payment': 'افزودن پرداخت',
            'add_notification': 'افزودن اعلان',
            'add_ticket': 'افزودن تیکت',
            'generate_report': 'ایجاد گزارش',
            'schedule_report': 'زمان‌بندی گزارش',
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
            'transaction_id': 'شناسه تراکنش',
            'amount': 'مبلغ',
            'payment_method': 'روش پرداخت',
            'created_at': 'تاریخ ایجاد',
            'user': 'کاربر',
            'session': 'جلسه',
            'date': 'تاریخ',
            'time': 'زمان',
            'type': 'نوع',
            'message': 'پیام',
            'recipient': 'گیرنده',
            'priority': 'اولویت',
            'subject': 'موضوع',
            'description': 'توضیحات',
            'category': 'دسته‌بندی',
            'assigned_to': 'واگذار شده به',
            'pending_refunds': 'بازپرداخت‌های در انتظار',
            'successful_payments': 'پرداخت‌های موفق',
            'todays_revenue': 'درآمد امروز',
            'total_revenue': 'کل درآمد',
            'payment_methods': 'روش‌های پرداخت',
            'recent_transactions': 'تراکنش‌های اخیر',
            'unread_notifications': 'اعلان‌های خوانده نشده',
            'system_alerts': 'هشدارهای سیستم',
            'user_notifications': 'اعلان‌های کاربر',
            'open_tickets': 'تیکت‌های باز',
            'resolved_tickets': 'تیکت‌های حل شده',
            'general_settings': 'تنظیمات عمومی',
            'system_settings': 'تنظیمات سیستم',
            'user_settings': 'تنظیمات کاربر',
            'security_settings': 'تنظیمات امنیتی',
            'search_payments': 'جستجوی پرداخت‌ها',
            'search_notifications': 'جستجوی اعلان‌ها',
            'search_tickets': 'جستجوی تیکت‌ها',
            'payments': 'پرداخت‌ها',
            'notifications': 'اعلان‌ها',
            'tickets': 'تیکت‌ها'
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
    
    print(f"✅ Fixed navigation and content in {file_path}")

# Fix the specific problematic pages
problematic_pages = [
    'apps/admin/dist/payments.html',
    'apps/admin/dist/analytics.html',
    'apps/admin/dist/reports.html',
    'apps/admin/dist/notifications.html',
    'apps/admin/dist/support.html',
    'apps/admin/dist/settings.html'
]

for file_path in problematic_pages:
    if os.path.exists(file_path):
        fix_navigation_and_content(file_path)
    else:
        print(f"File not found: {file_path}")

print("✅ FIXED ALL PROBLEMATIC PAGES!")
