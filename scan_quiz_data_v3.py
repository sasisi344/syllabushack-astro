
import json
import os
import re

files = [
    'src/data/quiz/fe/management.json',
    'src/data/quiz/fe/practical.json',
    'src/data/quiz/fe/strategy.json',
    'src/data/quiz/fe/technology.json'
]

results = []
pattern = re.compile(r'\[\s*a\s*\]')

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        for i, item in enumerate(data):
            q = item.get('question', '')
            s = item.get('scenario', '')
            
            if pattern.search(q):
                # 1. Check if completely missing in scenario
                if not pattern.search(s):
                    results.append({
                        'file': filepath,
                        'id': item.get('id'),
                        'index': i,
                        'issue': 'Missing [ a ] in scenario'
                    })
                # 2. Check if it only appears as part of a question-like sentence at the end
                else:
                    # Find instances of [ a ] that are NOT followed by "に入れるべき" or part of a question
                    # Or more simply, check if there's any instance that is NOT at the very end of the string
                    
                    # Let's count instances. If only 1 and it's in the last 100 chars, it's suspicious.
                    matches = list(pattern.finditer(s))
                    is_suspicious = True
                    for m in matches:
                        context = s[m.start()-20 : m.end()+20]
                        # If [ a ] is used in an assignment or expression, it's likely correct
                        if '←' in context or '=' in context or '(' in context or '[' in context:
                            if 'に入れるべき' not in context:
                                is_suspicious = False
                                break
                    
                    if is_suspicious:
                        results.append({
                            'file': filepath,
                            'id': item.get('id'),
                            'index': i,
                            'issue': '[ a ] seems to only appear in descriptive text, not in code'
                        })

with open('scan_results_v3.json', 'w', encoding='utf-8') as out:
    json.dump(results, out, ensure_ascii=False, indent=2)

print(f"Scan complete. Found {len(results)} issues.")
