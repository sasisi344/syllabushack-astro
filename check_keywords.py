
import json
import re

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    s = item.get('scenario', '')
    if re.search(r'戻る|真|偽|を終了する|終わり', s):
        print(f"ID: {item.get('id')} - Detected")
        lines = [line for line in s.split('\n') if re.search(r'戻る|真|偽|を終了する|終わり', line)]
        for l in lines:
            print("  ", l)
