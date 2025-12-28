
import re

# Read new config
with open("new_config_final_v2.js", "r", encoding="utf-8") as f:
    new_config_content = f.read()

# Read html file
with open("tspdimensoes.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find lines to replace
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "const CONFIG_PAGE_1 =" in line:
        start_idx = i
    if "const CONFIG_PAGE_2 =" in line:
        end_idx = i

if start_idx != -1 and end_idx != -1:
    # We replace from start_idx to end_idx (inclusive).
    # new_config_content has two lines: const CONFIG_PAGE_1 = ... \n const CONFIG_PAGE_2 = ...
    
    new_lines = lines[:start_idx] + [new_config_content] + lines[end_idx+1:]
    
    with open("tspdimensoes.html", "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Successfully replaced config V2.")
else:
    print("Could not find config lines.")
