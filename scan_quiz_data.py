
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

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        for i, item in enumerate(data):
            q = item.get('question', '')
            s = item.get('scenario', '')
            # Find [ a ] or [a] or [  a  ]
            pattern = re.compile(r'\[\s*a\s*\]')
            in_q = pattern.search(q)
            in_s = pattern.search(s)
            
            if in_q:
                # If it's in question, it MUST be in scenario in a relevant place
                # But sometimes the question text itself is repeated in the scenario
                # We want to find cases where it's NOT in the pseudo-code or code-like block
                if not in_s:
                    results.append({
                        'file': filepath,
                        'id': item.get('id'),
                        'index': i,
                        'issue': 'Missing [ a ] in scenario even though it is in question'
                    })
                else:
                    # Check if [ a ] in scenario is just part of the question repetition
                    # Many scenarios end with the question text
                    # We want to see if it exists ELSEWHERE in the scenario
                    s_clean = pattern.sub('', s, count=1) # remove one instance
                    if '空欄 [ a ] に入れるべき' in s and not pattern.search(s_clean):
                         results.append({
                            'file': filepath,
                            'id': item.get('id'),
                            'index': i,
                            'issue': '[ a ] only found in the repeated question text in scenario'
                        })

with open('scan_results.json', 'w', encoding='utf-8') as out:
    json.dump(results, out, ensure_ascii=False, indent=2)

print(f"Scan complete. Found {len(results)} issues.")
