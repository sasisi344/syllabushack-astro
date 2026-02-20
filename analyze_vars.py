
import json
import re

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

vars_set = set()

for item in data:
    s = item.get('scenario', '')
    for line in s.split('\n'):
        # match variable definitions: "整数: i, j, temp"
        if re.search(r'([整数|文字列|ノード|論理|真偽|配列][型]*\s*[:：]\s*)(.*)', line):
            m = re.search(r'([整数|文字列|ノード|論理|真偽|配列][型]*\s*[:：]\s*)(.*)', line)
            if not m:
                continue
            v_list = m.group(2).split(',')
            for v in v_list:
                v_clean = re.sub(r'//.*', '', v).strip()
                vars_set.add(v_clean)
        
        # match assignment: "一時 ← x"
        if '←' in line:
            left = line.split('←')[0].strip()
            left = re.sub(r'^\d+\s*\.?\s*', '', left)
            left = re.sub(r'//.*', '', left)
            # Remove array indices roughly
            left = re.sub(r'\[.*\]', '', left).strip()
            if left and ' ' not in left and '.' not in left and '}' not in left and '{' not in left:
                 vars_set.add(left)

for v in sorted(list(vars_set)):
    # only print mostly japanese ones
    if re.search(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]', v):
        print(v)
