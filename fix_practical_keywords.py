
import json
import re

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

def standardize_code(text):
    if not isinstance(text, str):
        return text
    # Replace '戻る' / '返却' -> 'return' when used as a command
    text = re.sub(r'(?<=[\s\n　])戻る(?=[\s\n]|$)', 'return', text)
    text = re.sub(r'(?<=[\s\n　])返却(?=[\s\n]|$)', 'return', text)
    
    # Specific edge cases seen where '戻る' has trailing stuff
    text = re.sub(r'(?<=[\s\n　])戻る\s+(.)', r'return \1', text)
    
    # Replace assignment and equality for True/False translated as 真/偽
    text = re.sub(r'←\s*真', '← true', text)
    text = re.sub(r'←\s*偽', '← false', text)
    text = re.sub(r'=\s*真', '= true', text)
    text = re.sub(r'=\s*偽', '= false', text)
    text = re.sub(r'return\s*真', 'return true', text)
    text = re.sub(r'return\s*偽', 'return false', text)
    
    text = re.sub(r'←\s*TRUE', '← true', text)
    text = re.sub(r'←\s*FALSE', '← false', text)
    text = re.sub(r'=\s*TRUE', '= true', text)
    text = re.sub(r'=\s*FALSE', '= false', text)

    text = re.sub(r'←\s*True', '← true', text)
    text = re.sub(r'←\s*False', '← false', text)
    text = re.sub(r'=\s*True', '= true', text)
    text = re.sub(r'=\s*False', '= false', text)

    text = re.sub(r'return\s*TRUE', 'return true', text)
    text = re.sub(r'return\s*FALSE', 'return false', text)
    text = re.sub(r'return\s*True', 'return true', text)
    text = re.sub(r'return\s*False', 'return false', text)
    return text

for item in data:
    if 'scenario' in item:
        item['scenario'] = standardize_code(item['scenario'])
    if 'question' in item:
        item['question'] = standardize_code(item['question'])
    if 'explanation' in item:
        item['explanation'] = standardize_code(item['explanation'])
    
    if 'options' in item:
        item['options'] = [standardize_code(opt) for opt in item['options']]
    if 'choices' in item:
        for choice in item['choices']:
            choice['text'] = standardize_code(choice['text'])

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Standardized keywords in practical.json")
