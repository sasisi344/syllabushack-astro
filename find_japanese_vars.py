
import json
import re

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

output = []
for item in data:
    s = item.get('scenario', '')
    lines = s.split('\n')
    bad_lines = []
    
    # Check for variables translated into Japanese in assignment or code logic
    # like 探索対象 ← target, 一時 ← temp, 配列の長さ ← array.length
    for line in lines:
        if '←' in line:
            # if left side of ← contains ONLY Japanese characters (kanji/hiragana/katakana) 
            # and it's not a standard pseudo-language structure like "要素 ←"
            left = line.split('←')[0].strip()
            # Remove line numbers and leading spaces
            left_clean = re.sub(r'^\d+\s*\.?\s*', '', left)
            
            if re.match(r'^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$', left_clean):
                 bad_lines.append(line.strip())
        elif re.search(r'もし.*?[=<>].*?ならば', line):
            # check if condition uses japanese var names
            cond = re.search(r'もし(.*?)ならば', line).group(1)
            if re.search(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+', cond) and not '真' in cond and not '偽' in cond:
                bad_lines.append(line.strip())
                
    if bad_lines:
         output.append(f"ID: {item['id']}")
         for b in bad_lines:
             output.append(f"  {b}")

with open('japanese_vars.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

