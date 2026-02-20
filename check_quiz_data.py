
import json
import os

files = [
    'src/data/quiz/fe/management.json',
    'src/data/quiz/fe/practical.json',
    'src/data/quiz/fe/strategy.json',
    'src/data/quiz/fe/technology.json'
]

def check_file(filepath):
    print(f"Checking {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for i, item in enumerate(data):
                q = item.get('question', '')
                s = item.get('scenario', '')
                if '[ a ]' in q or '空欄[a]' in q or '空欄 [ a ]' in q:
                    if '[ a ]' not in s:
                        print(f"Problem found in item {i} (id: {item.get('id')}):")
                        print(f"Question: {q}")
                        print(f"Scenario preview: {s[:100]}...")
                        print("-" * 20)
    except Exception as e:
        print(f"Error checking {filepath}: {e}")

for f in files:
    check_file(f)
