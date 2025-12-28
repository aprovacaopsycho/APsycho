
import os

file_path = r"c:\Users\NATHAN\OneDrive\ANTIGOS\Documentos\GitHub\APsycho\Base\teadi\teadi.html"

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    fixed = False
    for line in lines:
        # Check for the specific malformed line start
        # It has indentation spaces then starts with [{ "id": 0
        if line.strip().startswith('[{ "id": 0, "x": 81'):
            print("Found malformed line.")
            # Keep indentation
            indent_len = len(line) - len(line.lstrip())
            indent = line[:indent_len]
            content = line.lstrip()
            
            # Add the missing key
            new_line = indent + '"items": ' + content
            new_lines.append(new_line)
            fixed = True
        else:
            new_lines.append(line)

    if fixed:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Successfully fixed syntax error.")
    else:
        print("Could not find line to fix. Dumping first few chars of candidate lines:")
        for line in lines:
            if 'id": 0' in line:
                print(f"Candidate: {line[:50]}...")

except Exception as e:
    print(f"Error: {e}")
