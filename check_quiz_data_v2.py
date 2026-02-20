
import json
import os

files = [
    'src/data/quiz/fe/management.json',
    'src/data/quiz/fe/practical.json',
    'src/data/quiz/fe/strategy.json',
    'src/data/quiz/fe/technology.json'
]

output_file = 'quiz_problems.txt'

with open(output_file, 'w', encoding='utf-8') as log:
    for filepath in files:
        log.write(f"Checking {filepath}...\n")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for i, item in enumerate(data):
                    q = item.get('question', '')
                    s = item.get('scenario', '')
                    # Check for [ a ] in question but missing in scenario
                    if '[ a ]' in q or '空欄[a]' in q or '空欄 [ a ]' in q:
                        if '[ a ]' not in s:
                            log.write(f"Problem found in item {i} (id: {item.get('id')}):\n")
                            log.write(f"Question: {q}\n")
                            log.write(f"Scenario preview: {s[:200]}...\n")
                            log.write("-" * 20 + "\n")
                    # Also check for [a] (no spaces)
                    elif '[a]' in q:
                        if '[a]' not in s and '[ a ]' not in s:
                            log.write(f"Problem found in item {i} (id: {item.get('id')}):\n")
                            log.write(f"Question: {q}\n")
                            log.write(f"Scenario preview: {s[:200]}...\n")
                            log.write("-" * 20 + "\n")
        except Exception as e:
            log.write(f"Error checking {filepath}: {e}\n")

print("Done. Check quiz_problems.txt")
