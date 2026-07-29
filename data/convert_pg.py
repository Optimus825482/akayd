"""MySQL(mysql2) -> PostgreSQL(pg) server code converter"""
import re

filepath = r"d:\repos\akayd-n-tar-m\server\index.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace all db.execute( with db.query(
content = content.replace('db.execute(', 'db.query(')

# 2. Replace ? placeholders with $1, $2, $3... in SQL strings
def replace_placeholders(match):
    """Replace ? with $1, $2, ... in a SQL query call"""
    full = match.group(0)
    # Find the SQL string (first argument)
    # Pattern: db.query('...SQL...', [params])
    # Need to replace ? in the SQL string only
    
    # Find the SQL string
    i = full.index('(') + 1
    # Skip whitespace
    while full[i] == ' ':
        i += 1
    
    quote = full[i]
    end_quote = full.index(quote, i + 1)
    # Handle escaped quotes
    while full[end_quote - 1] == '\\' and end_quote < len(full):
        end_quote = full.index(quote, end_quote + 1)
    
    sql = full[i+1:end_quote]
    
    # Count existing $ placeholders (shouldn't exist but just in case)
    # Replace ? with numbered $1, $2...
    counter = 1
    new_sql_parts = []
    j = 0
    while j < len(sql):
        c = sql[j]
        if c == '?' and (j == 0 or sql[j-1] != '\\'):
            new_sql_parts.append(f'${counter}')
            counter += 1
        else:
            new_sql_parts.append(c)
        j += 1
    new_sql = ''.join(new_sql_parts)
    
    return full[:i+1] + new_sql + full[end_quote:]

# Pattern: match db.query('...') calls - SQL strings with ? placeholders
# We need to find all SQL strings containing ? inside db.query calls
content = re.sub(
    r"db\.query\(\s*'[^']*\?[^']*'",
    replace_placeholders,
    content
)

# 3. Add RETURNING id for INSERT statements that use insertId
# Find patterns like: const [result] = await db.query('INSERT INTO ...', [...]);
# And: result.insertId
# Change to: const result = await db.query('INSERT INTO ... RETURNING id', [...]);
# And: result.rows[0].id

# First, add RETURNING id to INSERT statements
def add_returning(match):
    full = match.group(0)
    if 'RETURNING' in full:
        return full
    # Find the closing quote of the SQL
    i = full.index('db.query(') + 9
    while full[i] == ' ':
        i += 1
    quote = full[i]
    end = full.index(quote, i + 1)
    return full[:end] + ' RETURNING id' + full[end:]

content = re.sub(
    r"db\.query\(\s*'INSERT INTO[^']*'",
    add_returning,
    content
)

# 4. Destructure pattern: const [xxx] = await db.query( -> const xxx = await db.query(
# This changes `const [rows] = ` to `const rows_result = `
# But we need to also change all references to `rows[0]` etc.

# Strategy: rename destructured variables and update references
# Pattern: const [varname] = await db.query
# This is complex. Let me do a simpler approach:
# - Find all `const [NAME] = await db.query(` and change to `const NAME = await db.query(`
# - Then find all `NAME[0]` and `NAME.length` and change to `NAME.rows[0]` and `NAME.rows.length`

matches = list(re.finditer(r"const\s+\[(\w+)\]\s*=\s*await\s+db\.query\(", content))
# Process in reverse to maintain positions
for match in reversed(matches):
    varname = match.group(1)
    # Replace the destructure
    old_dec = match.group(0)
    new_dec = old_dec.replace(f'const [{varname}]', f'const {varname}')
    content = content[:match.start()] + new_dec + content[match.end():]

# 5. Now replace varname[0] with varname.rows[0] and varname.length with varname.rows.length
# for all variables that were destructured from db.query
# We need to be smart - only replace for specific variable names
for match_obj in matches:
    varname = match_obj.group(1)
    # Replace varname[0] -> varname.rows[0]
    content = re.sub(
        rf'\b{re.escape(varname)}\[0\]',
        f'{varname}.rows[0]',
        content
    )
    # Replace varname.length -> varname.rows.length (but only when it's checking query results)
    content = re.sub(
        rf'\b{re.escape(varname)}\.length\b',
        f'{varname}.rows.length',
        content
    )

# 6. Replace insertId with rows[0].id
content = content.replace('result.insertId', 'result.rows[0].id')

# 7. Fix any remaining patterns where rows came directly from a non-destructured query
# rows.length -> result.rows.length (but we already handled destructured ones)

# 8. Fix specific edge case patterns:
# If there's `rows[0]` not preceded by `.rows`, it might need fixing
# Actually the destructured ones are already renamed. Any remaining `rows[0]` 
# should be from places where `const rows = result.rows` or similar.

# 9. Replace tinyint(1) / boolean handling - pg returns actual booleans
# is_read: 1 -> is_read: true etc - but these come from DB, no code changes needed

# 10. Fix cron job imports (cheerio is used in scraping)
# no changes needed for that

# 11. Fix server start
# no changes needed

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dönüşüm tamamlandı.")
print(f"db.execute -> db.query: {content.count('db.query(')} adet")
print(f"db.execute kalan: {content.count('db.execute(')} adet")
print(f"RETURNING id eklenen: {content.count('RETURNING id')} adet")
