
import json

filepath = 'src/data/quiz/fe/practical.json'
with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Fix Index 9 (id: fe-b-1771469635415)
# Add pseudo code to scenario
for item in data:
    if item['id'] == 'fe-b-1771469635415':
        item['scenario'] += "\n\n**擬似コード:**\n```pseudo\n〇 関数 RSA(message:配列(整数型), key:整数型, n:整数型) -> 配列(整数型)\n  encrypted:配列(整数型)  // 暗号化または復号後の配列\n  i:整数型\n\n  を i を 0 から messageの要素数 - 1 まで 1 ずつ増やす間\n    encrypted[i] ← [ a ]\n  終わり\n\n  return encrypted\n```"

# Fix Index 11 (id: fe-b-1771469663439)
# Replace code line 16 and remove trailing question
for item in data:
    if item['id'] == 'fe-b-1771469663439':
        s = item['scenario']
        s = s.replace('16.   current ← current.next', '16.   [ a ]')
        if '空欄 [ a ] に入れるべき適切な処理はどれか。' in s:
            s = s.replace('\n\n空欄 [ a ] に入れるべき適切な処理はどれか。', '')
        item['scenario'] = s

# Fix Index 22 (id: fe-b-1771470017401)
# Replace sales[j] > sales[j-1] with [ a ] in optimizedSortSales
for item in data:
    if item['id'] == 'fe-b-1771470017401':
        s = item['scenario']
        # We need to be careful as it appears twice. One in unoptimized, one in optimized.
        # Let's find the part after "optimizedSortSales"
        parts = s.split('optimizedSortSales')
        if len(parts) > 1:
            parts[1] = parts[1].replace('sales[j] > sales[j-1]', '[ a ]')
            item['scenario'] = 'optimizedSortSales'.join(parts)

# Fix Index 24 (id: fe-b-1771470036426) - The pattern match problem
for item in data:
    if item['id'] == 'fe-b-1771470036426':
        s = item['scenario']
        s = s.replace('return result', 'return [ a ]')
        item['scenario'] = s

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully updated 4 items in practical.json.")
