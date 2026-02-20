
import json

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    if item['id'] == 'fe-b-1771470036426':
        s = item['scenario']
        # Restore the ones that should be 'result' or '-1'
        # Line 5: was return result (now return [ a ])
        # Line 12: should be return [ a ]
        # Line 14: was return result (now return [ a ])
        
        # Actually, let's just rebuild the scenario for this one to be sure
        s = s.replace('5   return [ a ]', '5   return -1')
        s = s.replace('14 return [ a ]', '14 return -1')
        # Line 12 remains return [ a ]
        item['scenario'] = s

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Refined Item 24.")
