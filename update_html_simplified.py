#!/usr/bin/env python3

import os
import json

def update_html_with_simplified_translations(file_path):
    """Update HTML file to use simplified translations"""
    print(f"Updating {file_path}...")
    
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
    
    # Create a clean HTML structure with simplified translations
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
        
        // Load language files
        let translations = {{}};
        
        async function loadTranslations(language) {{
            try {{
                const response = await fetch(`/locales/${{language}}.json`);
                const data = await response.json();
                translations[language] = data;
                return data;
            }} catch (error) {{
                console.error('Error loading translations:', error);
                return {{}};
            }}
        }}
        
        let currentLanguage = 'en';

        // Load saved language preference
        async function loadLanguagePreference() {{
            const savedLanguage = localStorage.getItem('ev-admin-language');
            if (savedLanguage && ['en', 'ar', 'fa'].includes(savedLanguage)) {{
                currentLanguage = savedLanguage;
                await applyLanguage(currentLanguage);
            }}
        }}

        // Apply language changes
        async function applyLanguage(language) {{
            currentLanguage = language;
            
            // Load translations if not already loaded
            if (!translations[language]) {{
                await loadTranslations(language);
            }}
            
            // Update document direction and language
            document.documentElement.dir = ['ar', 'fa'].includes(language) ? 'rtl' : 'ltr';
            document.documentElement.lang = language;
            
            // Update all translatable elements
            const langData = translations[language];
            if (langData) {{
                // Update common elements
                if (langData.common) {{
                    for (const [key, value] of Object.entries(langData.common)) {{
                        const element = document.getElementById(key);
                        if (element) {{
                            element.textContent = value;
                        }}
                    }}
                }}
                
                // Update page-specific elements
                const pageKey = '{page_name.lower().replace(" ", "_")}';
                if (langData[pageKey]) {{
                    for (const [key, value] of Object.entries(langData[pageKey])) {{
                        const element = document.getElementById(key);
                        if (element) {{
                            element.textContent = value;
                        }}
                    }}
                }}
            }}
            
            // Update language switcher
            const languageNames = {{ en: 'English', ar: 'العربية', fa: 'فارسی' }};
            const languageFlags = {{ en: '🇺🇸', ar: '🇸🇦', fa: '🇮🇷' }};
            
            if (document.getElementById('current-language-name')) {{
                document.getElementById('current-language-name').textContent = languageNames[language];
            }}
            if (document.getElementById('current-language-flag')) {{
                document.getElementById('current-language-flag').textContent = languageFlags[language];
            }}
            
            // Update checkmarks
            document.querySelectorAll('.language-check').forEach(check => check.classList.add('hidden'));
            const checkElement = document.getElementById(`check-${{language}}`);
            if (checkElement) {{
                checkElement.classList.remove('hidden');
            }}
            
            // Save preference
            localStorage.setItem('ev-admin-language', language);
        }}

        // Toggle language dropdown
        function toggleLanguageDropdown() {{
            const dropdown = document.getElementById('language-dropdown');
            dropdown.classList.toggle('hidden');
        }}

        // Change language
        async function changeLanguage(language) {{
            await applyLanguage(language);
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
        document.addEventListener('DOMContentLoaded', async function() {{
            await loadLanguagePreference();
        }});
    </script>
</body>
</html>'''
    
    # Write the cleaned file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(clean_html)
    
    print(f"✅ Updated {file_path}")

import re

# Update all HTML files with simplified translations
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
        update_html_with_simplified_translations(file_path)
    else:
        print(f"File not found: {file_path}")

print("✅ All HTML files updated with simplified translations!")
