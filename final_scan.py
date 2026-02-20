
import json
import os
import re

directories = [
    'src/data/quiz/fe',
    'src/data/quiz/it-passport',
    'src/data/quiz/sg'
]

results = []
pattern = re.compile(r'\[\s*a\s*\]')

for directory in directories:
    if not os.path.exists(directory):
        continue
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                except:
                    continue
                for i, item in enumerate(data):
                    q = item.get('question', '')
                    s = item.get('scenario', '')
                    
                    if pattern.search(q):
                        if not pattern.search(s):
                            results.append({
                                'file': filepath,
                                'id': item.get('id'),
                                'index': i,
                                'issue': 'Missing [ a ] in scenario'
                            })
                        else:
                            matches = list(pattern.finditer(s))
                            is_suspicious = True
                            for m in matches:
                                context = s[m.start()-20 : m.end()+20]
                                if '←' in context or '=' in context or '(' in context or '[' in context:
                                    if 'に入れるべき' not in context:
                                        is_suspicious = False
                                        break
                            
                            if is_suspicious:
                                results.append({
                                    'file': filepath,
                                    'id': item.get('id'),
                                    'index': i,
                                    'issue': '[ a ] seems to only appear in descriptive text'
                                })

with open('final_scan_results.json', 'w', encoding='utf-8') as out:
    json.dump(results, out, ensure_ascii=False, indent=2)

print(f"Scan complete. Found {len(results)} issues total.")
