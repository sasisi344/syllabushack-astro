
import json
import re

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

def standardize_code_vars(text):
    if not isinstance(text, str):
        return text

    # Standardize 'temp'
    text = re.sub(r'(?<=[\s\n\[(])(?:一時|一時変数|一時退避|一時ポインタ)(?=[\s\n\])←=+\-*/])', 'temp', text)
    text = re.sub(r'^(?:一時|一時変数|一時退避|一時ポインタ)(?=[\s\n\])←=+\-*/])', 'temp', text, flags=re.MULTILINE)

    # Standardize 'result'
    text = re.sub(r'(?<=[\s\n\[(])結果(?=[\s\n\])←=+\-*/])', 'result', text)
    text = re.sub(r'^結果(?=[\s\n\])←=+\-*/])', 'result', text, flags=re.MULTILINE)

    # Standardize 'count'
    text = re.sub(r'(?<=[\s\n\[(])カウント(?=[\s\n\])←=+\-*/])', 'count', text)
    text = re.sub(r'^カウント(?=[\s\n\])←=+\-*/])', 'count', text, flags=re.MULTILINE)

    # Standardize 'current', 'previous', 'next'
    text = re.sub(r'(?<=[\s\n\[(])(?:現在のノード|カレントノード|カレント)(?=[\s\n\])←=+\-*/\.])', 'current', text)
    text = re.sub(r'^(?:現在のノード|カレントノード|カレント)(?=[\s\n\])←=+\-*/\.])', 'current', text, flags=re.MULTILINE)

    text = re.sub(r'(?<=[\s\n\[(])(?:前のノード|プレビオス)(?=[\s\n\])←=+\-*/\.])', 'previous', text)
    text = re.sub(r'^(?:前のノード|プレビオス)(?=[\s\n\])←=+\-*/\.])', 'previous', text, flags=re.MULTILINE)

    text = re.sub(r'(?<=[\s\n\.\[(])(?:次のノード|次ノード|ネクスト)(?=[\s\n\])←=+\-*/\.])', 'next', text)
    text = re.sub(r'^(?:次のノード|次ノード|ネクスト)(?=[\s\n\])←=+\-*/\.])', 'next', text, flags=re.MULTILINE)

    # Standardize 'head', 'tail'
    text = re.sub(r'(?<=[\s\n\[(])ヘッド(?=[\s\n\])←=+\-*/\.])', 'head', text)
    text = re.sub(r'^ヘッド(?=[\s\n\])←=+\-*/\.])', 'head', text, flags=re.MULTILINE)
    
    text = re.sub(r'(?<=[\s\n\[(])(?:テール|末尾|末尾ノード)(?=[\s\n\])←=+\-*/\.])', 'tail', text)
    text = re.sub(r'^(?:テール|末尾|末尾ノード)(?=[\s\n\])←=+\-*/\.])', 'tail', text, flags=re.MULTILINE)

    # Standardize 'index'
    text = re.sub(r'(?<=[\s\n\[(])インデックス(?=[\s\n\])←=+\-*/])', 'index', text)
    text = re.sub(r'^インデックス(?=[\s\n\])←=+\-*/])', 'index', text, flags=re.MULTILINE)
    
    # Also standardize general forms in text like 「変数 一時変数 は」 -> 「変数 temp は」
    text = text.replace('変数 一時変数', '変数 temp')
    text = text.replace('変数 一時', '変数 temp')
    text = text.replace('変数 結果', '変数 result')
    text = text.replace('変数 カウント', '変数 count')
    text = text.replace('変数 インデックス', '変数 index')
    text = text.replace('変数 現在のノード', '変数 current')
    text = text.replace('変数 カレントノード', '変数 current')
    text = text.replace('変数 前のノード', '変数 previous')
    text = text.replace('変数 次のノード', '変数 next')
    text = text.replace('変数 ヘッド', '変数 head')
    text = text.replace('変数 テール', '変数 tail')
    text = text.replace('変数 末尾', '変数 tail')

    # Remove translated array methods like .長さ -> .length or の長さ -> .length inside code blocks
    # Actually, keep it simple for now as it's dangerous. Let's see how much this fixes.
    return text

for item in data:
    if 'scenario' in item:
        item['scenario'] = standardize_code_vars(item['scenario'])
    if 'question' in item:
        item['question'] = standardize_code_vars(item['question'])
    if 'explanation' in item:
        item['explanation'] = standardize_code_vars(item['explanation'])
    
    if 'options' in item:
        item['options'] = [standardize_code_vars(opt) for opt in item['options']]
    if 'choices' in item:
        for choice in item['choices']:
            choice['text'] = standardize_code_vars(choice['text'])

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Standardized translated code variables in practical.json")
