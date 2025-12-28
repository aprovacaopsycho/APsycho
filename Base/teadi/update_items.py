import os

# Define paths
base_dir = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base\teadi"
html_path = os.path.join(base_dir, "teadi.html")
json_path = os.path.join(base_dir, "temp_items.json")

print(f"Reading JSON from {json_path}")
try:
    with open(json_path, 'r', encoding='utf-8') as f:
        new_items = f.read().strip()
    print(f"Read {len(new_items)} characters from JSON file.")
except Exception as e:
    print(f"Error reading JSON: {e}")
    exit(1)

print(f"Reading HTML from {html_path}")
try:
    with open(html_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
except Exception as e:
    print(f"Error reading HTML: {e}")
    exit(1)

new_lines = []
updated = False
for line in lines:
    if '"items": [{' in line:
        indent = line.split('"items":')[0]
        # We replace the entire line with the new items array
        # Ensure proper JSON formatting: "items": [...], (no comma at end based on file analysis, wait, line 468 is '},' so line 467 needs no comma)
        # Checking file content:
        # 466: "imgWidth": ...,"boxH": 24,
        # 467: "items": [...]
        # 468: },
        # So "items": [...] (no comma)
        
        # However, the user provided JSON is [...].
        # We need to output: `                    "items": [...]` + newline
        new_lines.append(f'{indent}"items": {new_items}\n')
        updated = True
        print("Updated items line.")
    else:
        new_lines.append(line)

if not updated:
    print("Warning: Could not find '\"items\": [{' line to replace!")
else:
    print(f"Writing updated HTML to {html_path}")
    try:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Success!")
    except Exception as e:
        print(f"Error writing HTML: {e}")
