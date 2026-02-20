
import json
import re

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

def clean_text(text):
    if not isinstance(text, str):
        return text
    
    # Text replacements for boolean values
    text = text.replace('真を、そうでない場合は偽', 'trueを、そうでない場合はfalse')
    text = text.replace('真、そうでなければ偽', 'true、そうでなければfalse')
    text = text.replace('TRUE を、存在しない場合は FALSE', 'true を、存在しない場合は false')
    text = text.replace('真（true）', 'true')
    text = text.replace('偽（false）', 'false')
    text = text.replace('= 真', '= true')
    text = text.replace('= 偽', '= false')
    text = text.replace('= TRUE', '= true')
    text = text.replace('= FALSE', '= false')
    
    # Specific edge cases
    text = text.replace('真値', 'true値')
    text = text.replace('偽値', 'false値')
    
    return text

for item in data:
    if 'scenario' in item:
        item['scenario'] = clean_text(item['scenario'])
    if 'question' in item:
        item['question'] = clean_text(item['question'])
    if 'explanation' in item:
        item['explanation'] = clean_text(item['explanation'])
    
    if 'options' in item:
        item['options'] = [clean_text(opt) for opt in item['options']]
    if 'choices' in item:
        for choice in item['choices']:
            choice['text'] = clean_text(choice['text'])

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Cleaned up remaining translated booleans in practical.json")
