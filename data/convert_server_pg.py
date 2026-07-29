"""MySQL(mysql2) -> PostgreSQL(pg) server code converter"""
import re

filepath = r"d:\repos\akayd-n-tar-m\server\index.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: db.execute -> db.query
content = content.replace('db.execute(', 'db.query(')

# Step 2: Replace ? placeholders with $1, $2, ... in SQL strings within db.query calls
# Find SQL strings inside db.query('...', [params]) or db.query(`...`, [params])
def fix_placeholders_in_sql(match):
    full = match.group(0)
    # Find the SQL string
    start = full.index("('") + 2 if "('" in full else full.index('(`') + 2 if '(`' in full else -1
    if start == -1:
        return full

    quote_char = full[start - 1]
    # Find matching end quote
    i = start
    while i < len(full):
        if full[i] == quote_char and (i == start or full[i-1] != '\\'):
            break
        i += 1
    sql = full[start:i]
    remaining = full[i:]

    # Replace ? with $1, $2...
    counter = 1
    new_sql = []
    j = 0
    while j < len(sql):
        if sql[j] == '?' and (j == 0 or sql[j-1] != '\\'):
            new_sql.append(f'${counter}')
            counter += 1
        else:
            new_sql.append(sql[j])
        j += 1
    
    return full[:start] + ''.join(new_sql) + remaining

content = re.sub(r"db\.query\([^)]*?\?[^)]*?\)", fix_placeholders_in_sql, content)

# Step 3: Add RETURNING id to INSERT statements (only those not already having it)
def add_returning(match):
    full = match.group(0)
    if 'RETURNING' in full or 'returning' in full:
        return full
    # Find end of SQL string
    if "'" in full[full.index('('):]:
        idx = full.index("'", full.index('(') + 1)
        quote = "'"
        end = full.index(quote, idx + 1)
        return full[:end] + ' RETURNING id' + full[end:]
    return full

content = re.sub(r"db\.query\(\s*'INSERT INTO(?!.*RETURNING.*)'[^']*'", add_returning, content, flags=re.IGNORECASE)

# Alternative: find all INSERT that don't have RETURNING
lines = content.split('\n')
new_lines = []
for line in lines:
    if 'db.query(' in line and 'INSERT' in line and 'RETURNING' not in line:
        # Add RETURNING id before the closing quote
        parts = line.split("'")
        new_parts = []
        found_sql = False
        for i, part in enumerate(parts):
            if not found_sql and ('INSERT' in part or ('INSERT' in parts[i-1] if i > 0 else False)):
                # This is the SQL string, add RETURNING id
                new_parts.append(part)
                found_sql = True
            elif found_sql and i < len(parts) - 1:
                # End of SQL string - add RETURNING id before closing
                if not parts[i-1].endswith(' RETURNING id') and not parts[i-1].endswith(' RETURNING id '):
                    new_parts[-1] = parts[i-1] + ' RETURNING id'
                new_parts.append(part)
                found_sql = False
            else:
                new_parts.append(part)
        new_lines.append("'".join(new_parts))
    else:
        new_lines.append(line)
content = '\n'.join(new_lines)

# Step 4: Fix destructured variables from db.query
# Pattern: const [varname] = await db.query(  OR  const [rows] = await db.query(
# Change to: const varname = await db.query( OR const result = await db.query(
# Then update all references of varname[0] -> varname.rows[0], varname.length -> varname.rows.length

# Find all destructured db.query results
pattern = re.compile(r"const\s+\[(\w+)\]\s*=\s*await\s+db\.query\(")
matches = list(pattern.finditer(content))

# Process matches (reverse to maintain positions)
var_names = set()
for match in reversed(matches):
    varname = match.group(1)
    var_names.add(varname)
    content = content[:match.start()] + f'const {varname} = await db.query(' + content[match.end():]

# Now fix references for each variable
for varname in sorted(var_names, key=len, reverse=True):  # longer names first to avoid partial matches
    # varname[0] -> varname.rows[0]
    content = re.sub(rf'\b{re.escape(varname)}\[(\d+)\]', rf'{varname}.rows[\1]', content)
    # varname.length -> varname.rows.length (only when checking results)
    # Be careful not to replace .length within strings
    content = re.sub(rf'(\b{re.escape(varname)})\.length\b', rf'\1.rows.length', content)

# Step 5: Fix insertId references
content = content.replace('result.insertId', 'result.rows[0].id')

# Step 6: Fix specific patterns
# existing[0] -> existing.rows[0] for vars that were destructured
# (already handled by step 4's regex)

# Step 7: Fix any remaining destructured vars
# If there are still patterns like `const [totalRows] = await db.query(...` 
# they would be caught by steps above

# Step 8: Fix rows[0] patterns that come from non-destructured queries
# These would be like: const rows = result.rows; rows[0]
# Actually step 4 already handles this

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Report
remaining_executes = content.count('db.execute(')
remaining_questions = len(re.findall(r'await db\.query\([^)]*\?[^)]*\)', content))
print(f"Dönüşüm tamamlandı.")
print(f"db.query() çağrıları: {content.count('db.query(')}")
print(f"Kalan db.execute(): {remaining_executes}")
print(f"Kalan ? placeholder: {remaining_questions}")
print(f"RETURNING id: {content.count('RETURNING id')} adet")
print(f"Düzeltilen destructured variable: {len(var_names)} adet")
