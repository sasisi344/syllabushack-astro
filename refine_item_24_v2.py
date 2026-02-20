
import json
import re

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    if item['id'] == 'fe-b-1771470036426':
        s = item['scenario']
        # Replace line 5 return [ a ] with return -1
        s = re.sub(r'5\s+return\s+\[\s*a\s*\]', '5   return -1', s)
        # Replace line 14 return [ a ] with return -1
        s = re.sub(r'14\s+return\s+\[\s*a\s*\]', '14  return -1', s)
        item['scenario'] = s

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Refined Item 24 with regex.")
