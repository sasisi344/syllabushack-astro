
import json
import re

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

output = []
for item in data:
    s = item.get('scenario', '')
    if re.search(r'戻る|返却|真|偽|True|False|TRUE|FALSE', s):
        lines = [line.strip() for line in s.split('\n') if re.search(r'戻る|返却|真|偽|True|False|TRUE|FALSE', line)]
        if lines:
            output.append(f"ID: {item.get('id')}")
            for l in lines:
                output.append(f"  {l}")

with open('check_out_utf8.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

