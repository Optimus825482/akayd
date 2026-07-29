"""Server kodunda sadece SQL placeholder dönüşümü yapar"""
import re

filepath = r"d:\repos\akayd-n-tar-m\server\index.js"

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. db.execute => db.query
text = text.replace('db.execute(', 'db.query(')

# 2. Replace ? => $1,$2... inside SQL strings
# Strategy: iterate through text, when we find db.query(, parse the SQL string args and fix them

result = []
i = 0
n = len(text)

while i < n:
    # Find next db.query( or end
    marker = text.find('db.query(', i)
    if marker == -1:
        result.append(text[i:])
        break
    
    # Copy everything up to db.query(
    result.append(text[i:marker + 9])  # 'db.query('
    
    # Now parse the arguments of db.query(...)
    # Track parentheses and string delimiters
    j = marker + 9
    depth = 1
    args_start = j
    
    # We need to find each SQL string argument and fix its ? placeholders
    counter = 1
    in_single = False
    
    while j < n and depth > 0:
        c = text[j]
        
        if c == '\\' and j + 1 < n:
            result.append(text[j:j+2])
            j += 2
            continue
        
        if c == "'" and not in_single:
            # Opening a SQL string
            in_single = True
            result.append(c)
            j += 1
            continue
        
        if c == "'" and in_single:
            # Check if this is closing the SQL string or escaped
            if j + 1 < n and text[j+1] == "'":
                # Escaped quote ''
                result.append("''")
                j += 2
                continue
            in_single = False
            result.append(c)
            j += 1
            continue
        
        if in_single and c == '?':
            result.append(f'${counter}')
            counter += 1
        elif in_single:
            result.append(c)
        elif c == '(':
            depth += 1
            result.append(c)
        elif c == ')':
            depth -= 1
            result.append(c)
        else:
            result.append(c)
        
        j += 1
    
    # After the closing paren of db.query, reset counter
    # (new db.query call will reset in next iteration since we find it fresh)
    i = j

final = ''.join(result)

# 3. Fix destructured variables: const [VAR] = await db.query( => const VAR = await db.query(
# Only for variables coming from db.query
pattern = re.compile(r"const\s+\[(\w+)\]\s*=\s*await\s+db\.query\(")
name_map = {}
for m in pattern.finditer(final):
    name_map[m.group(1)] = True

for name in sorted(name_map, key=len, reverse=True):
    final = final.replace(f'const [{name}] = await db.query(', f'const {name} = await db.query(')

# 4. Fix references: name[0] => name.rows[0], name.length => name.rows.length
for name in sorted(name_map, key=len, reverse=True):
    final = re.sub(rf'\b{re.escape(name)}\[(\d+)\]', rf'{name}.rows[\1]', final)
    final = re.sub(rf'\b{re.escape(name)}\.length\b', f'{name}.rows.length', final)

# 5. insertId => rows[0].id
final = final.replace('result.insertId', 'result.rows[0].id')

# 6. Add RETURNING id to INSERT statements
def add_returning_id(text):
    """Add RETURNING id to INSERT queries"""
    lines = text.split('\n')
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if 'db.query(' in stripped and 'INSERT' in stripped and 'RETURNING' not in stripped:
            # Find the SQL string ending quote
            if "'" in line:
                parts = line.rsplit("'", 2)
                if len(parts) >= 2:
                    # Add RETURNING id before last quote
                    line = line.rsplit("'", 1)[0] + ' RETURNING id' + "'" + line.rsplit("'", 1)[1]
        new_lines.append(line)
    return '\n'.join(new_lines)

final = add_returning_id(final)

# 7. Fix rows.rows double access (edge case from previous conversion)
final = final.replace('.rows.rows[', '.rows[')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(final)

# Report
remaining_q = final.count('?')
db_query_count = final.count('db.query(')
returning_count = final.count('RETURNING id')
print(f"db.query() calls: {db_query_count}")
print(f"Kalan ?: {remaining_q} (should be 0 for SQL, some for ternary)")
print(f"RETURNING id: {returning_count}")
print(f"Fixed destructured vars: {len(name_map)}")
