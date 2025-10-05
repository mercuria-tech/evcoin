#!/usr/bin/env python3

import json
import re

# Read the current Farsi file
with open('apps/admin/dist/locales/fa.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Split by } followed by { to get individual JSON objects
parts = re.split(r'}\s*{', content)

# Clean up the parts
cleaned_parts = []
for i, part in enumerate(parts):
    if i == 0:
        # First part - remove the opening {
        part = part.strip()
        if part.startswith('{'):
            part = part[1:]
    elif i == len(parts) - 1:
        # Last part - remove the closing }
        part = part.strip()
        if part.endswith('}'):
            part = part[:-1]
    else:
        # Middle parts - clean up
        part = part.strip()
    
    cleaned_parts.append(part)

# Parse each part as JSON and combine them
combined_data = {}
for part in cleaned_parts:
    if part.strip():
        try:
            # Add back the braces to make it valid JSON
            json_str = '{' + part + '}'
            data = json.loads(json_str)
            combined_data.update(data)
        except json.JSONDecodeError as e:
            print(f"Error parsing part: {e}")
            print(f"Problematic part: {part[:100]}...")

# Write the corrected Farsi file
with open('apps/admin/dist/locales/fa.json', 'w', encoding='utf-8') as f:
    json.dump(combined_data, f, ensure_ascii=False, indent=2)

print("✅ Fixed Farsi JSON structure!")
print(f"📊 Farsi file now has {len(json.dumps(combined_data, indent=2).splitlines())} lines")

# Validate the file
try:
    with open('apps/admin/dist/locales/fa.json', 'r', encoding='utf-8') as f:
        json.load(f)
    print("✅ Farsi JSON is now valid!")
except json.JSONDecodeError as e:
    print(f"❌ Still has errors: {e}")
