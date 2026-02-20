
import json
import os

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for i, item in enumerate(data):
    if '空欄 [ a ] に入れるべき' in item.get('question', ''):
        print(f"Index: {i}, ID: {item.get('id')}")
        print(f"Question: {item.get('question')}")
        # print first 50 chars of scenario
        print(f"Scenario Start: {item.get('scenario')[:100]}...")
        if '[ a ]' in item.get('scenario', ''):
             # Check if it appears in code (indented or with arrows)
             if '←' in item.get('scenario', ''):
                 if '[ a ]' in item.get('scenario', '').split('←')[-1]:
                     print("Status: Likely OK (found in assignment)")
                 else:
                     # Check if it's there but maybe not in assignment
                     print("Status: Partially OK (found in scenario)")
             else:
                 print("Status: Potential Issue (no arrows found)")
        else:
            print("Status: BROKEN (missing [ a ])")
        print("-" * 20)
