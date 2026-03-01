import re
import json
import os

# --- UTILS ---
DECODER_SCRIPT = """
    <!-- SEGURANÇA TITAN -->
    <script>
    (function(){
        // DOMAIN LOCK
        var allowed = ['localhost', '127.0.0.1', 'aprovacaopsycho.com.br', 'nathann.github.io']; 
        var hostname = window.location.hostname;
        var protocol = window.location.protocol;
        
        if (protocol === 'file:' || (hostname && !allowed.some(d => hostname.endsWith(d)))) {
             console.warn("Titan Security: Execução fora do domínio oficial detectada.");
             // document.body.innerHTML = '<div style="color:red;padding:20px;text-align:center;"><h1>Acesso Negado</h1><p>Este arquivo foi protegido e não pode ser executado localmente.</p></div>';
             // throw new Error("Titan Security: Access Denied");
        }
    })();

    function _titan_decode(encoded) {
        const key = "titan_secure_key";
        try {
            const decodedB64 = atob(encoded);
            const bytes = new Uint8Array(decodedB64.length);
            for (let i = 0; i < decodedB64.length; i++) {
                bytes[i] = decodedB64.charCodeAt(i);
            }
            
            const keyBytes = new TextEncoder().encode(key);
            const decryptedBytes = new Uint8Array(bytes.length);
            
            for (let i = 0; i < bytes.length; i++) {
                decryptedBytes[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
            }
            
            const jsonStr = new TextDecoder().decode(decryptedBytes);
            
            // For BFP variables that might be arrays/objects but passed as string,
            // or if the string is just an object literal (not strict JSON),
            // JSON.parse is strict. If the original data was strict JSON, it works.
            // If it was JS object literal, we might need a safer eval or ensure generator sends JSON.
            // Our generator uses json.dumps or raw extraction.
            // Let's try JSON.parse first, fallback to eval if syntax error (risky but functional for internal tool).
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Titan Security: Falha na decodificação.", e);
            // Fallback for object literals if JSON.parse fails?
            // try { return new Function('return ' + jsonStr)(); } catch(e2) { console.error(e2); }
            return {};
        }
    }
    </script>
"""

def extract_payload_from_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            # If the file contains header lines like in previous versions, filter them.
            # But now we expect raw payload.
            # Fallback heuristic: take the longest line if multiline.
            if '\n' in content:
                lines = content.splitlines()
                longest = max(lines, key=len)
                if len(longest) > 100:
                    return longest
            return content
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def apply_tedif3():
    print("Applying security to tedif3_secure.html...")
    
    # 1. Get Payload
    payload = extract_payload_from_file('tedif3_payload.txt')
    if not payload:
        print("Error: Could not find payload for TEDIF3")
        return

    # 2. Read HTML
    # 2. Read HTML from SOURCE
    source_file = 'TEDIF/tedif3.html'
    target_file = 'TEDIF/tedif3_secure.html'
    
    if not os.path.exists(source_file):
        print(f"Error: {source_file} not found")
        return

    with open(source_file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # 3. Inject Security Script
    if "_titan_decode" not in html:
        html = html.replace('</head>', DECODER_SCRIPT + '\n</head>')
    
    # 4. Replace Config
    # Pattern: match `config: { ... }` inside Alpine component
    # We need to match `config:\s*\{` and end at the matching brace.
    # This is hard with regex.
    # Alternative: The file `tedif3_secure.html` was created from `tedif3.html`.
    # I know the structure.
    # `config: {` starts at line ~574.
    # It ends at line ~629 `},`.
    pass
    # Let's use string manipulation with known markers from the file logic
    
    start_marker = "config: {"
    end_marker = "}," # The comma is important if it's followed by other properties like `state:`
    
    start_idx = html.find(start_marker)
    if start_idx != -1:
        # Find the end of this object.
        # Since I know the content, I can verify.
        # It's better to find the closing brace that matches indentation?
        # Let's count braces.
        
        idx = start_idx + len("config:")
        open_braces = 0
        found_start = False
        end_idx = -1
        
        for i in range(idx, len(html)):
            if html[i] == '{':
                open_braces += 1
                found_start = True
            elif html[i] == '}':
                open_braces -= 1
                if found_start and open_braces == 0:
                    end_idx = i + 1
                    break
        
        if end_idx != -1:
            # We found the block.
            original_block = html[start_idx:end_idx]
            new_block = f"config: _titan_decode('{payload}')"
            html = html.replace(original_block, new_block)
            print("Swapped config object with obfuscated payload.")
        else:
            print("Error: Could not parse config object end.")
            print(f"Start index: {start_idx}")
    else:
        print("Error: Could not find config object start.")
        print(f"Searching for '{start_marker}' in html of length {len(html)}")

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(html)


def apply_bfp():
    print("Applying security to bfp_secure.html...")
    
    # 1. Get Payloads
    if not os.path.exists('bfp_payload.txt'):
         print("Error: bfp_payload.txt not found")
         return

    with open('bfp_payload.txt', 'r', encoding='utf-8') as f:
        payloads = json.load(f) # It's a JSON file with keys
    
    # 2. Read HTML from SOURCE
    if not os.path.exists('bfp.html'):
        print("Error: bfp.html not found")
        return
        
    with open('bfp.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 3. Inject Security Script
    if "_titan_decode" not in html:
        html = html.replace('</head>', DECODER_SCRIPT + '\n</head>')
    
    # 4. Replace variables
    # const DATA_QUESTIONS = [ ... ];
    # const DATA_CRITERIA = { ... };
    # const DATA_PERCENTILES = { ... };
    
    for var_name in ["DATA_QUESTIONS", "DATA_CRITERIA", "DATA_PERCENTILES"]:
        # Regex to capture the whole declaration including semicolon
        # Using DotAll to capture multiline
        # Pattern: const VAR = [ ... ]; OR { ... };
        # We'll use a specific regex for each to be safe or a generic one.
        # The variables act as anchors.
        
        # We construct a regex that matches `const NAME = ... ;`
        # Non-greedy match until `;` might fail if strings contain `;`.
        # But looking at BFP data, it's mostly numbers/strings.
        # Safe bet: `const VAR =` ... `];` or `};`
        
        if var_name == "DATA_QUESTIONS":
             pattern = r"const\s+DATA_QUESTIONS\s*=\s*\[.*?\];"
        else:
             pattern = r"const\s+" + var_name + r"\s*=\s*\{.*?\};"
        
        match = re.search(pattern, html, re.DOTALL)
        if match:
            original_code = match.group(0)
            obf_str = payloads.get(var_name, "")
            new_code = f"const {var_name} = _titan_decode('{obf_str}');"
            html = html.replace(original_code, new_code)
            print(f"Replaced {var_name}")
        else:
            print(f"Warning: Could not find {var_name}")

    with open('bfp_secure.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == "__main__":
    apply_tedif3()
    apply_bfp()
