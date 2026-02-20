
import json
import re
import os

directories = [
    'src/data/quiz/fe',
    'src/data/quiz/it-passport',
    'src/data/quiz/sg'
]

output = []
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
                for item in data:
                    s = item.get('scenario', '')
                    if re.search(r'戻る|返却|真|偽|True|False|TRUE|FALSE', s):
                        lines = [line.strip() for line in s.split('\n') if re.search(r'戻る|返却|真|偽|True|False|TRUE|FALSE', line)]
                        if lines:
                            output.append(f"File: {filepath} | ID: {item.get('id')}")
                            for l in lines:
                                output.append(f"  {l}")

with open('check_out_utf8.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

