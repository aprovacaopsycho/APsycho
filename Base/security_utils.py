import json
import base64
import sys

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
    b64_str = base64.b64encode(encrypted_bytes).decode('utf-8')
    return b64_str

def generate_decoder_js(key="titan_secure_key"):
    return f"""
    function _titan_decode(encoded) {{
        const key = "{key}";
        const decodedB64 = atob(encoded);
        let result = "";
        for (let i = 0; i < decodedB64.length; i++) {{
            const keyChar = key.charCodeAt(i % key.length);
            result += String.fromCharCode(decodedB64.charCodeAt(i) ^ keyChar);
        }}
        return JSON.parse(result);
    }}
    """

# --- DATA EXTRACTION & GENERATION ---
# This part mimics reading the files and extracting data manually for this task

# 1. TEDIF-3 Config Data (Extracted from file view)
tedif3_config = {
    "boxW": 4,
    "boxH": 3.5,
    "items": [
        { "id": 1, "x": 91.99, "y": 94.99 },
        { "id": 2, "x": 34.74, "y": 40.76 },
        { "id": 3, "x": 39.43, "y": 77.66 },
        { "id": 4, "x": 95.6, "y": 5.61 },
        { "id": 5, "x": 68.15, "y": 73.92 },
        { "id": 6, "x": 7.65, "y": 23.56 },
        { "id": 7, "x": 58.58, "y": 93.62 },
        { "id": 8, "x": 61.29, "y": 15.71 },
        { "id": 9, "x": 6.75, "y": 65.69 },
        { "id": 10, "x": 93.8, "y": 45.38 },
        { "id": 11, "x": 7.29, "y": 91.37 },
        { "id": 12, "x": 38.35, "y": 66.07 },
        { "id": 13, "x": 75.92, "y": 93.24 },
        { "id": 14, "x": 91.27, "y": 56.22 },
        { "id": 15, "x": 8.91, "y": 40.39 },
        { "id": 16, "x": 33.66, "y": 30.17 },
        { "id": 17, "x": 91.45, "y": 28.17 },
        { "id": 18, "x": 23.9, "y": 5.73 },
        { "id": 19, "x": 22.28, "y": 83.77 },
        { "id": 20, "x": 61.11, "y": 4.49 },
        { "id": 21, "x": 71.94, "y": 44.38 },
        { "id": 22, "x": 24.81, "y": 18.95 },
        { "id": 23, "x": 22.28, "y": 48.37 },
        { "id": 24, "x": 75.74, "y": 81.15 },
        { "id": 25, "x": 49.37, "y": 27.42 },
        { "id": 26, "x": 6.2, "y": 51.73 },
        { "id": 27, "x": 71.4, "y": 55.1 },
        { "id": 28, "x": 24.63, "y": 95.74 },
        { "id": 29, "x": 83.5, "y": 37.15 },
        { "id": 30, "x": 20.11, "y": 61.21 },
        { "id": 31, "x": 55.15, "y": 80.53 },
        { "id": 32, "x": 6.75, "y": 78.16 },
        { "id": 33, "x": 91.81, "y": 17.45 },
        { "id": 34, "x": 53.16, "y": 39.64 },
        { "id": 35, "x": 41.96, "y": 89.63 },
        { "id": 36, "x": 43.77, "y": 18.57 },
        { "id": 37, "x": 92.17, "y": 71.68 },
        { "id": 38, "x": 53.88, "y": 52.11 },
        { "id": 39, "x": 11.26, "y": 13.96 },
        { "id": 40, "x": 93.44, "y": 82.52 },
        { "id": 41, "x": 37.99, "y": 53.73 },
        { "id": 42, "x": 78.63, "y": 8.73 },
        { "id": 43, "x": 80.25, "y": 65.07 },
        { "id": 44, "x": 41.96, "y": 7.73 },
        { "id": 45, "x": 76.82, "y": 22.19 },
        { "id": 46, "x": 20.65, "y": 73.67 },
        { "id": 47, "x": 67.43, "y": 32.54 },
        { "id": 48, "x": 17.76, "y": 30.54 },
        { "id": 49, "x": 56.95, "y": 65.07 },
        { "id": 50, "x": 6.02, "y": 4.61 }
    ]
}

# 2. BFP Data (Partial Check - I will read file to get full content, but assuming standard format)
# Note: Since BFP data is huge, I will use a placeholder or read from file in a real scenario.
# For this script, I'm just outputting the TEDIF3 payload to start.

print("Generating TEDIF3 payload...")
payload = obfuscate(tedif3_config)
with open('tedif3_payload.txt', 'w', encoding='utf-8') as f:
    f.write(payload)
print("Payload written to tedif3_payload.txt")

# print("\n--- DECODER FUNCTION ---")
# print(generate_decoder_js())
