#!/bin/bash

# Script to add RTL language support to remaining admin pages
# This will add the language switcher and RTL support to all remaining pages

echo "Adding RTL language support to remaining admin pages..."

# Function to add RTL CSS to a page
add_rtl_css() {
    local file=$1
    echo "Adding RTL CSS to $file..."
    
    # Add RTL CSS before closing </style> tag
    sed -i.bak '/<\/style>/i\
        /* RTL Support */\
        [dir="rtl"] {\
            direction: rtl;\
        }\
\
        [dir="rtl"] .ml-auto {\
            margin-left: auto;\
            margin-right: 0;\
        }\
\
        [dir="rtl"] .mr-auto {\
            margin-right: auto;\
            margin-left: 0;\
        }\
\
        [dir="rtl"] .ml-2 {\
            margin-left: 0.5rem;\
            margin-right: 0;\
        }\
\
        [dir="rtl"] .mr-2 {\
            margin-right: 0.5rem;\
            margin-left: 0;\
        }\
\
        [dir="rtl"] .ml-3 {\
            margin-left: 0.75rem;\
            margin-right: 0;\
        }\
\
        [dir="rtl"] .mr-3 {\
            margin-right: 0.75rem;\
            margin-left: 0;\
        }\
\
        [dir="rtl"] .ml-4 {\
            margin-left: 1rem;\
            margin-right: 0;\
        }\
\
        [dir="rtl"] .mr-4 {\
            margin-right: 1rem;\
            margin-left: 0;\
        }\
\
        [dir="rtl"] .ml-6 {\
            margin-left: 1.5rem;\
            margin-right: 0;\
        }\
\
        [dir="rtl"] .mr-6 {\
            margin-right: 1.5rem;\
            margin-left: 0;\
        }\
\
        [dir="rtl"] .pl-2 {\
            padding-left: 0.5rem;\
            padding-right: 0;\
        }\
\
        [dir="rtl"] .pr-2 {\
            padding-right: 0.5rem;\
            padding-left: 0;\
        }\
\
        [dir="rtl"] .pl-3 {\
            padding-left: 0.75rem;\
            padding-right: 0;\
        }\
\
        [dir="rtl"] .pr-3 {\
            padding-right: 0.75rem;\
            padding-left: 0;\
        }\
\
        [dir="rtl"] .pl-4 {\
            padding-left: 1rem;\
            padding-right: 0;\
        }\
\
        [dir="rtl"] .pr-4 {\
            padding-right: 1rem;\
            padding-left: 0;\
        }\
\
        [dir="rtl"] .pl-6 {\
            padding-left: 1.5rem;\
            padding-right: 0;\
        }\
\
        [dir="rtl"] .pr-6 {\
            padding-right: 1.5rem;\
            padding-left: 0;\
        }\
\
        [dir="rtl"] .left-0 {\
            left: auto;\
            right: 0;\
        }\
\
        [dir="rtl"] .right-0 {\
            right: auto;\
            left: 0;\
        }\
\
        [dir="rtl"] .left-3 {\
            left: auto;\
            right: 0.75rem;\
        }\
\
        [dir="rtl"] .right-3 {\
            right: auto;\
            left: 0.75rem;\
        }\
\
        [dir="rtl"] .left-4 {\
            left: auto;\
            right: 1rem;\
        }\
\
        [dir="rtl"] .right-4 {\
            right: auto;\
            left: 1rem;\
        }\
\
        [dir="rtl"] .text-left {\
            text-align: right;\
        }\
\
        [dir="rtl"] .text-right {\
            text-align: left;\
        }\
\
        [dir="rtl"] .flex-row {\
            flex-direction: row-reverse;\
        }\
\
        [dir="rtl"] .flex-row-reverse {\
            flex-direction: row;\
        }\
\
        [dir="rtl"] .border-l {\
            border-left: none;\
            border-right: 1px solid;\
        }\
\
        [dir="rtl"] .border-r {\
            border-right: none;\
            border-left: 1px solid;\
        }\
\
        [dir="rtl"] .border-l-4 {\
            border-left: none;\
            border-right: 4px solid;\
        }\
\
        [dir="rtl"] .border-r-4 {\
            border-right: none;\
            border-left: 4px solid;\
        }\
\
        [dir="rtl"] .rounded-l {\
            border-top-left-radius: 0;\
            border-bottom-left-radius: 0;\
            border-top-right-radius: 0.25rem;\
            border-bottom-right-radius: 0.25rem;\
        }\
\
        [dir="rtl"] .rounded-r {\
            border-top-right-radius: 0;\
            border-bottom-right-radius: 0;\
            border-top-left-radius: 0.25rem;\
            border-bottom-left-radius: 0.25rem;\
        }\
\
        [dir="rtl"] .rounded-l-lg {\
            border-top-left-radius: 0;\
            border-bottom-left-radius: 0;\
            border-top-right-radius: 0.5rem;\
            border-bottom-right-radius: 0.5rem;\
        }\
\
        [dir="rtl"] .rounded-r-lg {\
            border-top-right-radius: 0;\
            border-bottom-right-radius: 0;\
            border-top-left-radius: 0.5rem;\
            border-bottom-left-radius: 0.5rem;\
        }\
\
        [dir="rtl"] .space-x-2 > * + * {\
            margin-left: 0;\
            margin-right: 0.5rem;\
        }\
\
        [dir="rtl"] .space-x-3 > * + * {\
            margin-left: 0;\
            margin-right: 0.75rem;\
        }\
\
        [dir="rtl"] .space-x-4 > * + * {\
            margin-left: 0;\
            margin-right: 1rem;\
        }\
\
        [dir="rtl"] .space-x-6 > * + * {\
            margin-left: 0;\
            margin-right: 1.5rem;\
        }\
\
        [dir="rtl"] .space-y-2 > * + * {\
            margin-top: 0.5rem;\
            margin-bottom: 0;\
        }\
\
        [dir="rtl"] .space-y-3 > * + * {\
            margin-top: 0.75rem;\
            margin-bottom: 0;\
        }\
\
        [dir="rtl"] .space-y-4 > * + * {\
            margin-top: 1rem;\
            margin-bottom: 0;\
        }\
\
        [dir="rtl"] .space-y-6 > * + * {\
            margin-top: 1.5rem;\
            margin-bottom: 0;\
        }\
\
        /* Language Switcher */\
        .language-switcher {\
            position: relative;\
            display: inline-block;\
        }\
\
        .language-dropdown {\
            position: absolute;\
            top: 100%;\
            right: 0;\
            margin-top: 0.5rem;\
            width: 12rem;\
            background-color: white;\
            border: 1px solid #e5e7eb;\
            border-radius: 0.5rem;\
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);\
            z-index: 50;\
        }\
\
        [dir="rtl"] .language-dropdown {\
            right: auto;\
            left: 0;\
        }\
\
        .language-option {\
            display: flex;\
            align-items: center;\
            width: 100%;\
            padding: 0.5rem 1rem;\
            text-align: left;\
            font-size: 0.875rem;\
            color: #374151;\
            border: none;\
            background: none;\
            cursor: pointer;\
            transition: background-color 0.15s ease-in-out;\
        }\
\
        [dir="rtl"] .language-option {\
            text-align: right;\
        }\
\
        .language-option:hover {\
            background-color: #f3f4f6;\
        }\
\
        .language-option.active {\
            background-color: #dbeafe;\
            color: #2563eb;\
        }\
\
        .language-flag {\
            font-size: 1.125rem;\
            margin-right: 0.75rem;\
        }\
\
        [dir="rtl"] .language-flag {\
            margin-right: 0;\
            margin-left: 0.75rem;\
        }\
\
        .language-name {\
            font-weight: 500;\
        }\
\
        .language-check {\
            margin-left: auto;\
            color: #2563eb;\
        }\
\
        [dir="rtl"] .language-check {\
            margin-left: 0;\
            margin-right: auto;\
        }\
' "$file"
}

# Update remaining pages
echo "Updating reports.html..."
add_rtl_css "apps/admin/dist/reports.html"

echo "Updating notifications.html..."
add_rtl_css "apps/admin/dist/notifications.html"

echo "Updating support.html..."
add_rtl_css "apps/admin/dist/support.html"

echo "Updating settings.html..."
add_rtl_css "apps/admin/dist/settings.html"

echo "RTL CSS added to all remaining pages!"
echo "Next step: Add language switcher and JavaScript to each page"
