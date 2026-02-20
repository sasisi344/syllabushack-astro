
import json
import os

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

output = []

for i, item in enumerate(data):
    if '空欄 [ a ] に入れるべき' in item.get('question', ''):
        s = item.get('scenario', '')
        status = "OK"
        if '[ a ]' not in s:
            status = "BROKEN (missing)"
        elif 'に入れるべき' in s and s.count('[ a ]') == 1:
            status = "BROKEN (only in text)"
        
        output.append(f"Index: {i}, ID: {item.get('id')}, Status: {status}")
        if status != "OK":
            output.append(f"  Question: {item.get('question')}")
            output.append(f"  Scenario End: {s[-100:]}")

with open('debug_summary.txt', 'w', encoding='utf-8') as out:
    out.write("\n".join(output))

print("Done.")
