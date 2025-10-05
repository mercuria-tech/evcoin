#!/usr/bin/env python3

import os
import re
import json

def fix_remaining_buttons_and_elements(file_path):
    """Fix remaining buttons and elements that don't have data-i18n attributes"""
    print(f"Fixing remaining buttons and elements in {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the title to determine the page name
    title_match = re.search(r'<title>EV Charging Platform - ([^<]+)</title>', content)
    page_name = title_match.group(1) if title_match else "Admin Dashboard"
    
    # Fix all remaining buttons and elements that don't have data-i18n attributes
    fixes = [
        # Buttons without data-i18n attributes
        (r'<button[^>]*>\s*View Details\s*</button>', '<button class="btn-primary px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"><span data-i18n="view_details">View Details</span></button>'),
        (r'<button[^>]*>\s*Mark as Read\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="mark_as_read">Mark as Read</span></button>'),
        (r'<button[^>]*>\s*Mark All Read\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="mark_all_read">Mark All Read</span></button>'),
        (r'<button[^>]*>\s*Send Notification\s*</button>', '<button class="btn-primary px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"><span data-i18n="send_notification">Send Notification</span></button>'),
        (r'<button[^>]*>\s*Add Notification\s*</button>', '<button class="btn-primary px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"><span data-i18n="add_notification">Add Notification</span></button>'),
        (r'<button[^>]*>\s*Filter\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="filter">Filter</span></button>'),
        (r'<button[^>]*>\s*Export\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="export">Export</span></button>'),
        (r'<button[^>]*>\s*Refresh\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="refresh">Refresh</span></button>'),
        (r'<button[^>]*>\s*Download\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="download">Download</span></button>'),
        (r'<button[^>]*>\s*Print\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="print">Print</span></button>'),
        (r'<button[^>]*>\s*Save\s*</button>', '<button class="btn-primary px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"><span data-i18n="save">Save</span></button>'),
        (r'<button[^>]*>\s*Cancel\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="cancel">Cancel</span></button>'),
        (r'<button[^>]*>\s*Edit\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="edit">Edit</span></button>'),
        (r'<button[^>]*>\s*Delete\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="delete">Delete</span></button>'),
        (r'<button[^>]*>\s*Configure\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="configure">Configure</span></button>'),
        (r'<button[^>]*>\s*View\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="view">View</span></button>'),
        
        # Support page specific buttons
        (r'<button[^>]*>\s*Add Ticket\s*</button>', '<button class="btn-primary px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"><span data-i18n="add_ticket">Add Ticket</span></button>'),
        (r'<button[^>]*>\s*Resolve Ticket\s*</button>', '<button class="btn-primary px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"><span data-i18n="resolve_ticket">Resolve Ticket</span></button>'),
        (r'<button[^>]*>\s*Close Ticket\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="close_ticket">Close Ticket</span></button>'),
        (r'<button[^>]*>\s*Assign Ticket\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="assign_ticket">Assign Ticket</span></button>'),
        (r'<button[^>]*>\s*Escalate Ticket\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="escalate_ticket">Escalate Ticket</span></button>'),
        
        # Settings page specific buttons
        (r'<button[^>]*>\s*Save Settings\s*</button>', '<button class="btn-primary px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"><span data-i18n="save_settings">Save Settings</span></button>'),
        (r'<button[^>]*>\s*Reset Settings\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="reset_settings">Reset Settings</span></button>'),
        (r'<button[^>]*>\s*Export Settings\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="export_settings">Export Settings</span></button>'),
        (r'<button[^>]*>\s*Import Settings\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="import_settings">Import Settings</span></button>'),
        (r'<button[^>]*>\s*Backup Settings\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="backup_settings">Backup Settings</span></button>'),
        (r'<button[^>]*>\s*Restore Settings\s*</button>', '<button class="btn-secondary px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors"><span data-i18n="restore_settings">Restore Settings</span></button>'),
        
        # Text elements that need translation
        (r'<p[^>]*>Station ST-005 is experiencing connectivity issues\. Immediate attention required\.</p>', '<p class="text-sm text-gray-600 mb-3" data-i18n="station_connectivity_issue">Station ST-005 is experiencing connectivity issues. Immediate attention required.</p>'),
        (r'<p[^>]*>User John Doe has completed a charging session\.</p>', '<p class="text-sm text-gray-600 mb-3" data-i18n="user_session_completed">User John Doe has completed a charging session.</p>'),
        (r'<p[^>]*>System maintenance scheduled for tonight at 2 AM\.</p>', '<p class="text-sm text-gray-600 mb-3" data-i18n="maintenance_scheduled">System maintenance scheduled for tonight at 2 AM.</p>'),
        
        # Table headers that might be missing
        (r'<th[^>]*>Notification ID</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="notification_id">Notification ID</th>'),
        (r'<th[^>]*>Ticket ID</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="ticket_id">Ticket ID</th>'),
        (r'<th[^>]*>Created At</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="created_at">Created At</th>'),
        (r'<th[^>]*>Updated At</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="updated_at">Updated At</th>'),
        (r'<th[^>]*>Resolved At</th>', '<th class="text-left py-3 px-4 font-medium text-gray-600" data-i18n="resolved_at">Resolved At</th>'),
        
        # Card descriptions
        (r'<p[^>]*>Require attention</p>', '<p class="text-sm text-gray-500" data-i18n="require_attention">Require attention</p>'),
        (r'<p[^>]*>Critical issues</p>', '<p class="text-sm text-gray-500" data-i18n="critical_issues">Critical issues</p>'),
        (r'<p[^>]*>User-related alerts</p>', '<p class="text-sm text-gray-500" data-i18n="user_related_alerts">User-related alerts</p>'),
        (r'<p[^>]*>Scheduled maintenance</p>', '<p class="text-sm text-gray-500" data-i18n="scheduled_maintenance">Scheduled maintenance</p>'),
        (r'<p[^>]*>Open tickets</p>', '<p class="text-sm text-gray-500" data-i18n="open_tickets">Open tickets</p>'),
        (r'<p[^>]*>Resolved tickets</p>', '<p class="text-sm text-gray-500" data-i18n="resolved_tickets">Resolved tickets</p>'),
        (r'<p[^>]*>General configuration</p>', '<p class="text-sm text-gray-500" data-i18n="general_configuration">General configuration</p>'),
        (r'<p[^>]*>System configuration</p>', '<p class="text-sm text-gray-500" data-i18n="system_configuration">System configuration</p>'),
        (r'<p[^>]*>User preferences</p>', '<p class="text-sm text-gray-500" data-i18n="user_preferences">User preferences</p>'),
        (r'<p[^>]*>Security settings</p>', '<p class="text-sm text-gray-500" data-i18n="security_settings">Security settings</p>'),
    ]
    
    # Apply all fixes
    for pattern, replacement in fixes:
        content = re.sub(pattern, replacement, content)
    
    # Create comprehensive translations including the new keys
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
            'add_notification': 'Add Notification',
            'send_notification': 'Send Notification',
            'add_ticket': 'Add Ticket',
            'resolve_ticket': 'Resolve Ticket',
            'close_ticket': 'Close Ticket',
            'assign_ticket': 'Assign Ticket',
            'escalate_ticket': 'Escalate Ticket',
            'save_settings': 'Save Settings',
            'reset_settings': 'Reset Settings',
            'export_settings': 'Export Settings',
            'import_settings': 'Import Settings',
            'backup_settings': 'Backup Settings',
            'restore_settings': 'Restore Settings',
            'edit': 'Edit',
            'delete': 'Delete',
            'view_details': 'View Details',
            'mark_as_read': 'Mark as Read',
            'mark_all_read': 'Mark All Read',
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
            'notification_id': 'Notification ID',
            'ticket_id': 'Ticket ID',
            'created_at': 'Created At',
            'updated_at': 'Updated At',
            'resolved_at': 'Resolved At',
            'unread_notifications': 'Unread Notifications',
            'system_alerts': 'System Alerts',
            'user_notifications': 'User Notifications',
            'open_tickets': 'Open Tickets',
            'resolved_tickets': 'Resolved Tickets',
            'general_settings': 'General Settings',
            'system_settings': 'System Settings',
            'user_settings': 'User Settings',
            'security_settings': 'Security Settings',
            'station_connectivity_issue': 'Station ST-005 is experiencing connectivity issues. Immediate attention required.',
            'user_session_completed': 'User John Doe has completed a charging session.',
            'maintenance_scheduled': 'System maintenance scheduled for tonight at 2 AM.',
            'require_attention': 'Require attention',
            'critical_issues': 'Critical issues',
            'user_related_alerts': 'User-related alerts',
            'scheduled_maintenance': 'Scheduled maintenance',
            'general_configuration': 'General configuration',
            'system_configuration': 'System configuration',
            'user_preferences': 'User preferences',
            'security_settings': 'Security settings'
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
            'add_notification': 'إضافة إشعار',
            'send_notification': 'إرسال إشعار',
            'add_ticket': 'إضافة تذكرة',
            'resolve_ticket': 'حل التذكرة',
            'close_ticket': 'إغلاق التذكرة',
            'assign_ticket': 'تعيين التذكرة',
            'escalate_ticket': 'تصعيد التذكرة',
            'save_settings': 'حفظ الإعدادات',
            'reset_settings': 'إعادة تعيين الإعدادات',
            'export_settings': 'تصدير الإعدادات',
            'import_settings': 'استيراد الإعدادات',
            'backup_settings': 'نسخ احتياطي للإعدادات',
            'restore_settings': 'استعادة الإعدادات',
            'edit': 'تعديل',
            'delete': 'حذف',
            'view_details': 'عرض التفاصيل',
            'mark_as_read': 'تعيين كمقروء',
            'mark_all_read': 'تعيين الكل كمقروء',
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
            'notification_id': 'معرف الإشعار',
            'ticket_id': 'معرف التذكرة',
            'created_at': 'تاريخ الإنشاء',
            'updated_at': 'تاريخ التحديث',
            'resolved_at': 'تاريخ الحل',
            'unread_notifications': 'الإشعارات غير المقروءة',
            'system_alerts': 'تنبيهات النظام',
            'user_notifications': 'إشعارات المستخدم',
            'open_tickets': 'التذاكر المفتوحة',
            'resolved_tickets': 'التذاكر المحلولة',
            'general_settings': 'الإعدادات العامة',
            'system_settings': 'إعدادات النظام',
            'user_settings': 'إعدادات المستخدم',
            'security_settings': 'إعدادات الأمان',
            'station_connectivity_issue': 'محطة ST-005 تواجه مشاكل في الاتصال. يتطلب انتباه فوري.',
            'user_session_completed': 'المستخدم جون دو أكمل جلسة شحن.',
            'maintenance_scheduled': 'صيانة النظام مجدولة لليلة في الساعة 2 صباحاً.',
            'require_attention': 'يتطلب انتباه',
            'critical_issues': 'قضايا حرجة',
            'user_related_alerts': 'تنبيهات متعلقة بالمستخدم',
            'scheduled_maintenance': 'صيانة مجدولة',
            'general_configuration': 'التكوين العام',
            'system_configuration': 'تكوين النظام',
            'user_preferences': 'تفضيلات المستخدم',
            'security_settings': 'إعدادات الأمان'
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
            'add_notification': 'افزودن اعلان',
            'send_notification': 'ارسال اعلان',
            'add_ticket': 'افزودن تیکت',
            'resolve_ticket': 'حل تیکت',
            'close_ticket': 'بستن تیکت',
            'assign_ticket': 'واگذاری تیکت',
            'escalate_ticket': 'ارتقای تیکت',
            'save_settings': 'ذخیره تنظیمات',
            'reset_settings': 'بازنشانی تنظیمات',
            'export_settings': 'خروجی تنظیمات',
            'import_settings': 'ورودی تنظیمات',
            'backup_settings': 'پشتیبان تنظیمات',
            'restore_settings': 'بازیابی تنظیمات',
            'edit': 'ویرایش',
            'delete': 'حذف',
            'view_details': 'مشاهده جزئیات',
            'mark_as_read': 'علامت‌گذاری به عنوان خوانده شده',
            'mark_all_read': 'علامت‌گذاری همه به عنوان خوانده شده',
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
            'notification_id': 'شناسه اعلان',
            'ticket_id': 'شناسه تیکت',
            'created_at': 'تاریخ ایجاد',
            'updated_at': 'تاریخ بروزرسانی',
            'resolved_at': 'تاریخ حل',
            'unread_notifications': 'اعلان‌های خوانده نشده',
            'system_alerts': 'هشدارهای سیستم',
            'user_notifications': 'اعلان‌های کاربر',
            'open_tickets': 'تیکت‌های باز',
            'resolved_tickets': 'تیکت‌های حل شده',
            'general_settings': 'تنظیمات عمومی',
            'system_settings': 'تنظیمات سیستم',
            'user_settings': 'تنظیمات کاربر',
            'security_settings': 'تنظیمات امنیتی',
            'station_connectivity_issue': 'ایستگاه ST-005 با مشکلات اتصال مواجه است. نیاز به توجه فوری دارد.',
            'user_session_completed': 'کاربر جان دو جلسه شارژ را تکمیل کرده است.',
            'maintenance_scheduled': 'نگهداری سیستم برای امشب ساعت 2 صبح برنامه‌ریزی شده است.',
            'require_attention': 'نیاز به توجه',
            'critical_issues': 'مسائل بحرانی',
            'user_related_alerts': 'هشدارهای مربوط به کاربر',
            'scheduled_maintenance': 'نگهداری برنامه‌ریزی شده',
            'general_configuration': 'پیکربندی عمومی',
            'system_configuration': 'پیکربندی سیستم',
            'user_preferences': 'ترجیحات کاربر',
            'security_settings': 'تنظیمات امنیتی'
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
    
    print(f"✅ Fixed remaining buttons and elements in {file_path}")

# Fix the remaining problematic pages
remaining_problematic_pages = [
    'apps/admin/dist/notifications.html',
    'apps/admin/dist/support.html',
    'apps/admin/dist/settings.html'
]

for file_path in remaining_problematic_pages:
    if os.path.exists(file_path):
        fix_remaining_buttons_and_elements(file_path)
    else:
        print(f"File not found: {file_path}")

print("✅ FIXED ALL REMAINING PROBLEMATIC PAGES!")
