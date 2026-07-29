"""MySQL -> PostgreSQL dönüşüm - multi-line SQL desteği"""
import re

filepath = r"d:\repos\akayd-n-tar-m\server\index.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all db.query(...) calls with ? placeholders
# Use a state machine approach for multiline matching

lines = content.split('\n')
new_lines = []
i = 0
in_db_query = False
query_start = -1
bracket_depth = 0
placeholder_counter = 0

while i < len(lines):
    line = lines[i]
    
    # Check for db.query( start
    if 'db.query(' in line and not in_db_query:
        in_db_query = True
        query_start = i
        bracket_depth = 0
        # Count opening parens from db.query position
        pos = line.index('db.query(')
        for c in line[pos:]:
            if c == '(': bracket_depth += 1
            elif c == ')': bracket_depth -= 1
    
    if in_db_query:
        for c in line:
            if c == '(': bracket_depth += 1
            elif c == ')': bracket_depth -= 1
    
    new_lines.append(line)
    
    if in_db_query and bracket_depth <= 0:
        in_db_query = False
        bracket_depth = 0
    
    i += 1

# Simpler approach: just process the whole file as a single string
# Find all INSERT/UPDATE queries that still have ?
# Pattern: inside db.query(...) calls that span multiple lines

def fix_all_placeholders(text):
    """Fix remaining ? placeholders in db.query calls"""
    result = []
    i = 0
    n = len(text)
    
    while i < n:
        # Check for db.query( start
        if text[i:i+9] == 'db.query(':
            result.append(text[i])
            i += 1
            continue
        
        # If we're inside a SQL string (between quotes), fix ?
        result.append(text[i])
        i += 1
    
    return ''.join(result)

# Actual fix: process the whole file and replace ? with $1,$2... in each db.query call
new_content = []
i = 0
n = len(content)
PATTERN = 'db.query('

while i < n:
    found = content.find(PATTERN, i)
    if found == -1:
        new_content.append(content[i:])
        break
    
    # Copy everything before this match
    new_content.append(content[i:found])
    
    # Find the matching closing paren
    j = found + len(PATTERN)
    depth = 1
    in_single = False
    in_double = False
    in_backtick = False
    
    # Collect SQL strings that need placeholder fixing
    sql_ranges = []  # (start, end, type) - type: 'single', 'double', 'backtick'
    
    while j < n and depth > 0:
        c = content[j]
        
        if c == '\\':
            j += 2
            continue
        
        if c == "'" and not in_double and not in_backtick:
            if in_single:
                sql_ranges[-1] = (sql_ranges[-1][0], j, sql_ranges[-1][2])
                in_single = False
            else:
                sql_ranges.append((j, None, 'single'))
                in_single = True
        elif c == '"' and not in_single and not in_backtick:
            if in_double:
                in_double = False
            else:
                sql_ranges.append((j, None, 'double'))
                in_double = True
        elif c == '`' and not in_single and not in_double:
            if in_backtick:
                sql_ranges[-1] = (sql_ranges[-1][0], j, sql_ranges[-1][2])
                in_backtick = False
            else:
                sql_ranges.append((j, None, 'backtick'))
                in_backtick = True
        elif c == '(' and not in_single and not in_double and not in_backtick:
            depth += 1
        elif c == ')' and not in_single and not in_double and not in_backtick:
            depth -= 1
        
        j += 1
    
    # Extract the full db.query call
    call_text = content[found:j]
    
    # Fix placeholders in SQL strings
    fixed_call = list(call_text)
    for sql_start, sql_end, sql_type in sql_ranges:
        if sql_end is None:
            continue
        sql = call_text[sql_start:sql_end+1]
        if '?' in sql:
            counter = 1
            new_sql = []
            for char in sql:
                if char == '?':
                    new_sql.append(f'${counter}')
                    counter += 1
                else:
                    new_sql.append(char)
            # Replace in the full call
            fixed_sql = ''.join(new_sql)
            fixed_call = list(call_text)
            fixed_call[sql_start:sql_end+1] = list(fixed_sql)
    
    # If any placeholders were fixed, use the fixed version; add RETURNING id for INSERT
    fixed_text = ''.join(fixed_call)
    
    # Add RETURNING id for INSERT statements that don't have it
    if 'INSERT' in fixed_text and 'RETURNING' not in fixed_text:
        # Find the SQL string(s) containing INSERT
        insert_fixed = []
        p = 0
        while p < len(fixed_text):
            # Look for quoted string containing INSERT
            for q in ["'", '`']:
                qi = fixed_text.find(q, p)
                if qi != -1:
                    qend = fixed_text.find(q, qi + 1)
                    if qend != -1:
                        inner = fixed_text[qi+1:qend]
                        if 'INSERT' in inner and 'RETURNING' not in inner:
                            fixed_text = fixed_text[:qend] + ' RETURNING id' + fixed_text[qend:]
                            break
            p += 1
    
    new_content.append(fixed_text)
    i = j

final_content = ''.join(new_content)

# Count remaining ?
remaining = sum(1 for i, c in enumerate(final_content) if c == '?')
print(f"Kalan ?: {remaining}")

# Additional fix - find multiline SQL with ? in db.query
# Use a simpler approach: find all db.query lines, fix ? inside

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Dönüşüm tamamlandı.")
print(f"Toplam db.query: {final_content.count('db.query(')}")
print(f"RETURNING id: {final_content.count('RETURNING id')}")
