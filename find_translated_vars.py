
import json
import re

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

output = []
for item in data:
    s = item.get('scenario', '')
    q = item.get('question', '')
    o = ' '.join(item.get('options', []))
    
    # Extract all english variable names from options
    english_vars = set(re.findall(r'\b[a-zA-Z_]\w*\b', o))
    
    # Only keep those strictly not in scenario
    missing_vars = []
    for var in english_vars:
        if var not in s and var not in ['True', 'False', 'true', 'false', 'null', 'NULL', 'AND', 'OR', 'NOT', 'None', 'none', 'return', 'if', 'else', 'while', 'for', 'break', 'i', 'j', 'n', 'a', 'b']:
            missing_vars.append(var)
    
    if missing_vars:
         output.append(f"ID: {item['id']}")
         output.append(f"Missing in scenario: {missing_vars}")
         output.append(f"Question: {q}")
         output.append(f"Options: {item.get('options')}")
         output.append("---")

with open('translated_vars.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

