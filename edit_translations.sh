#!/bin/bash

# Script to help edit translations in bulk
# Usage: ./edit_translations.sh

echo "Translation Editor Helper"
echo "========================"
echo ""

# Function to edit a specific translation
edit_translation() {
    local key=$1
    local lang=$2
    local new_value=$3
    
    local file="apps/admin/dist/locales/${lang}.json"
    
    if [ -f "$file" ]; then
        # Use sed to replace the translation
        sed -i.bak "s/\"${key}\": \".*\"/\"${key}\": \"${new_value}\"/" "$file"
        echo "✅ Updated ${key} in ${lang}.json to: ${new_value}"
    else
        echo "❌ File ${file} not found"
    fi
}

# Function to add a new translation
add_translation() {
    local key=$1
    local lang=$2
    local value=$3
    
    local file="apps/admin/dist/locales/${lang}.json"
    
    if [ -f "$file" ]; then
        # Add the new translation to the common section
        sed -i.bak "/\"common\": {/a\\
    \"${key}\": \"${value}\"," "$file"
        echo "✅ Added ${key} to ${lang}.json: ${value}"
    else
        echo "❌ File ${file} not found"
    fi
}

# Function to show current translations
show_translation() {
    local key=$1
    
    echo "Current translations for '${key}':"
    echo "================================"
    
    for lang in en ar fa; do
        local file="apps/admin/dist/locales/${lang}.json"
        if [ -f "$file" ]; then
            local value=$(grep "\"${key}\":" "$file" | cut -d'"' -f4)
            echo "${lang}: ${value}"
        fi
    done
    echo ""
}

# Interactive menu
while true; do
    echo "Choose an option:"
    echo "1. Edit existing translation"
    echo "2. Add new translation"
    echo "3. Show current translation"
    echo "4. Deploy changes"
    echo "5. Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            echo ""
            read -p "Enter translation key (e.g., 'dashboard'): " key
            echo ""
            echo "Enter new translations:"
            read -p "English: " en_value
            read -p "Arabic: " ar_value
            read -p "Farsi: " fa_value
            
            edit_translation "$key" "en" "$en_value"
            edit_translation "$key" "ar" "$ar_value"
            edit_translation "$key" "fa" "$fa_value"
            echo ""
            ;;
        2)
            echo ""
            read -p "Enter new translation key: " key
            echo ""
            echo "Enter translations:"
            read -p "English: " en_value
            read -p "Arabic: " ar_value
            read -p "Farsi: " fa_value
            
            add_translation "$key" "en" "$en_value"
            add_translation "$key" "ar" "$ar_value"
            add_translation "$key" "fa" "$fa_value"
            echo ""
            ;;
        3)
            echo ""
            read -p "Enter translation key to show: " key
            show_translation "$key"
            ;;
        4)
            echo ""
            echo "Deploying changes..."
            cd apps/admin && wrangler pages deploy dist --project-name ev-charging-admin --commit-dirty=true
            cd ../..
            echo "✅ Changes deployed!"
            echo ""
            ;;
        5)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            echo ""
            ;;
    esac
done
