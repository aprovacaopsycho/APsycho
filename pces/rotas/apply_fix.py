
import re

html_path = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base\rotas\rotac.html"
json_path = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base\rotas\config_fixed.json"

print("Reading files...")
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

with open(json_path, 'r', encoding='utf-8') as f:
    new_items_json = f.read().strip()

# 1. Replace Items
print("Replacing config items...")
# We need to find "items": [...]
# Be careful with regex on large multiline strings.
# We look for "items": [ ... ]
# Since the format in the file is minified/single line for items, we can try to find the start and end of the array.

start_marker = '"items": ['
if start_marker not in html_content:
    print("Could not find start of items array")
    exit(1)

start_pos = html_content.find(start_marker) + len('"items": ')
# Finding the matching closing bracket is tricky if there are nested objects, but here items is an array of objects.
# We can find the closing ] that is followed by a closing } of the config object OR a comma if there were more props (there aren't really).
# However, in the file, we saw: ... "t": 0 }],
# Let's count brackets or look for the end of the config block.
# Actually, the file structure is `config: { ... "items": [...] }`.
# Let's find the `]` that closes `items`. 
# Or we can just use string replacement if we are sure about the structure.

# Let's iterate to find the matching bracket
depth = 0
found_start = False
end_pos = -1

for i in range(start_pos, len(html_content)):
    char = html_content[i]
    if char == '[':
        depth += 1
        found_start = True # We are already starting after the first [ but wait... 
        # start_pos was set to find(start_marker) + len('"items": ').
        # start_marker included the opening [.
        # So start_pos is at index of [.
        pass
    
    # Actually, let's reset.
    pass

# Redo finding logic
# "items": [ ... ]
# We know the start index of [.
array_start_idx = html_content.find(start_marker) + len('"items": ') - 1 # This should be the index of [
current_idx = array_start_idx + 1
depth = 1 # We are inside the first [

while depth > 0 and current_idx < len(html_content):
    if html_content[current_idx] == '[':
        depth += 1
    elif html_content[current_idx] == ']':
        depth -= 1
    current_idx += 1

if depth != 0:
    print("Could not find end of items array")
    exit(1)

array_end_idx = current_idx # This is the index after the closing ]

# Perform replacement
new_html = html_content[:array_start_idx] + new_items_json + html_content[array_end_idx:]

# 2. Remove Audio "start"
print("Removing 'start' audio definition...")
# Look for: start: new Audio('../../vozes/sinal.mp3'),
new_html = re.sub(r"\s*start: new Audio\('[^']+'\),?", "", new_html)

# 3. Remove dependencies on "start" audio
print("Removing 'start' audio usage...")
# Look for: this.audio.start.play();
new_html = new_html.replace('this.audio.start.play();', '// Audio removido')

print("Writing updated file...")
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Updates applied successfully.")
