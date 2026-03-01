import re
import json
import base64

def obfuscate(data, key="titan_secure_key"):
    # Convert data to JSON string or use raw string
    if not isinstance(data, str):
        json_str = json.dumps(data, ensure_ascii=False)
    else:
        json_str = data
    
    # XOR encryption on bytes
    # 1. Encode string to UTF-8 bytes
    data_bytes = json_str.encode('utf-8')
    key_bytes = key.encode('utf-8')
    
    # 2. XOR bytes
    encrypted_bytes = bytearray()
    for i, b in enumerate(data_bytes):
        encrypted_bytes.append(b ^ key_bytes[i % len(key_bytes)])
    
    # 3. Base64 encode the encrypted bytes
    return base64.b64encode(encrypted_bytes).decode('utf-8')

# Read BFP HTML
with open('bfp.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to extract JS objects: const DATA_X = { ... }; or [ ... ];
# We need to be careful with nested braces/brackets.
# Since the data is formatted nicely in the file (I saw it), we can use a simpler approach or a regex that matches until the logical end.

def extract_variable(var_name, text):
    # Regex to find "const var_name = " and then capture until the semicolon
    # This assumes the variable declaration ends with a semicolon and is standard JSON-like structure
    pattern = r"const\s+" + var_name + r"\s*=\s*([\[\{].*?);\s*$"
    # Multiline matching might be tricky.
    # Let's try to find the start index and then count brackets to find the end.
    
    start_marker = f"const {var_name} ="
    start_idx = text.find(start_marker)
    if start_idx == -1:
        return None
    
    start_idx += len(start_marker)
    
    # Find list/object start
    while start_idx < len(text) and text[start_idx] not in ['[', '{']:
        start_idx += 1
    
    if start_idx >= len(text):
        return None
    
    opener = text[start_idx]
    closer = ']' if opener == '[' else '}'
    
    cnt = 1
    idx = start_idx + 1
    while idx < len(text) and cnt > 0:
        if text[idx] == opener:
            cnt += 1
        elif text[idx] == closer:
            cnt -= 1
        idx += 1
    
    if cnt == 0:
        return text[start_idx:idx] # Return the JSON string
    return None

questions_json = extract_variable("DATA_QUESTIONS", content)
criteria_json = extract_variable("DATA_CRITERIA", content)
percentiles_json = extract_variable("DATA_PERCENTILES", content)

if not questions_json:
    print("Error: DATA_QUESTIONS not found")
else:
    # We can just minify it to save space before obfuscating? 
    # Actually, let's keep it robust. Parsing as JSON to minify.
    # Note: The JS in file might use single quotes or keys without quotes, which standard json.loads might fail.
    # However, looking at the file earlier: keys have quotes, strings have double quotes. It looks like valid JSON.
    # Except `inverted: true` (boolean). JSON uses lower case true/false which is valid.
    # Wait, `inverted: true`? If it's valid JSON, good.
    # If it's JS object literal, `json.loads` might fail if keys aren't quoted or if commas are trailing.
    # I saw `criteria_json` has keys like `"N1": ...` so it looks good.
    pass

# We will treat them as raw strings to be safe from parsing errors, and just obfuscate the string directly.
# This means the decoder will `JSON.parse` the result, so the result MUST be valid JSON.
# If the original source was valid JS object literal but NOT valid JSON (e.g. trailing comma), JSON.parse might fail.
# But for security obfuscation, we usually want to obfuscate the *source code string* and `eval` it OR `JSON.parse` it.
# If I use `JSON.parse` in decoder, I must ensure the string is valid JSON.
# The `extract_variable` returns the raw string from the file.
# If that string contains comments or trailing commas, `JSON.parse` will crash.
# A safer decoder uses `eval` or `new Function` but `JSON.parse` is better.
# Let's assume the source is valid JSON for now, or use `eval` in the decoder for `bfp` if we are unsure.
# Actually, looking at `bfp.html`:
# `const DATA_QUESTIONS = [ ... ];`
# It looks like standard JSON.
# I'll stick to treating it as a string and allow the decoder to handle it.
# To be super safe, the decoder for BFP can use `eval('(' + result + ')')` which handles any JS object literal.

obf_questions = obfuscate(questions_json) if questions_json else ""
obf_criteria = obfuscate(criteria_json) if criteria_json else ""
obf_percentiles = obfuscate(percentiles_json) if percentiles_json else ""

output = {
    "DATA_QUESTIONS": obf_questions,
    "DATA_CRITERIA": obf_criteria,
    "DATA_PERCENTILES": obf_percentiles
}

with open('bfp_payload.txt', 'w', encoding='utf-8') as f:
    json.dump(output, f)

print("BFP payloads generated.")
