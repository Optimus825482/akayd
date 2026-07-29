"""CSV'leri PostgreSQL'e import - sütun eşleştirmeli"""
import csv, subprocess, os, re

PG_USER = "postgres"
PG_HOST = "localhost"
PG_PORT = "5432"
PG_DB = "akaydin_tarim"
DATA_DIR = r"d:\repos\akayd-n-tar-m\data"
PSQL = r"C:\Program Files\PostgreSQL\17\bin\psql.exe"
os.environ['PGPASSWORD'] = '518518Erkan'


def fix_date(v):
    if not v or not v.strip():
        return '\\N'
    v = v.strip()
    m = re.match(r'(\d{1,2})/(\d{1,2})/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})', v)
    if m:
        d, M, y, h, mn, s = m.groups()
        return f'{y}-{M.zfill(2)}-{d.zfill(2)} {h.zfill(2)}:{mn}:{s}'
    m = re.match(r'(\d{1,2})/(\d{1,2})/(\d{4})', v)
    if m:
        d, M, y = m.groups()
        return f'{y}-{M.zfill(2)}-{d.zfill(2)}'
    return v


def date_cols(headers):
    return {h for h in headers if any(x in h.lower() for x in ['_at', 'date', '_time'])}


def imp(table, fname):
    path = os.path.join(DATA_DIR, fname)
    if not os.path.exists(path):
        print(f'  {table}: SKIP - file not found')
        return

    with open(path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        csv_headers = reader.fieldnames or []
        dc = date_cols(csv_headers)

        tmp = os.path.join(DATA_DIR, fname.replace('.csv', '_pg.csv'))
        rows = 0
        with open(tmp, 'w', encoding='utf-8', newline='') as fo:
            w = csv.DictWriter(fo, fieldnames=csv_headers, extrasaction='ignore')
            w.writeheader()
            for row in reader:
                out = {k: (fix_date(v) if k in dc else v) for k, v in row.items()}
                w.writerow(out)
                rows += 1

        if rows == 0:
            print(f'  {table}: 0 rows (empty)')
            os.remove(tmp)
            return

        abs_tmp = os.path.abspath(tmp).replace('\\', '/')
        # Use explicit column list matching CSV header order
        col_list = ', '.join(csv_headers)
        sql = f"\\copy {table} ({col_list}) FROM '{abs_tmp}' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');"
        r = subprocess.run(
            [PSQL, '-U', PG_USER, '-h', PG_HOST, '-p', PG_PORT, '-d', PG_DB, '-c', sql],
            capture_output=True, text=True, timeout=30
        )
        os.remove(tmp)

        if r.returncode == 0:
            print(f'  {table}: {rows} rows OK')
        else:
            err = r.stderr[:250].replace('\n', ' ').replace('ERROR:  ', '')
            print(f'  {table}: ERROR - {err}')


tables = [
    ('services', 'services.csv'),
    ('products', 'products.csv'),
    ('blog_posts', 'blog_posts.csv'),
    ('about_page', 'about_page.csv'),
    ('contact_page', 'contact_page.csv'),
    ('hazelnut_prices', 'hazelnut_prices.csv'),
    ('contact_messages', 'contact_messages.csv'),
    ('seo_settings', 'seo_settings.csv'),
    ('page_seo', 'page_seo.csv'),
    ('hero_content', 'hero_content.csv'),
    ('active_visitors', 'active_visitors.csv'),
    ('visitor_sessions', 'visitor_sessions.csv'),
    ('page_views', 'page_views.csv'),
    ('visitor_actions', 'visitor_actions.csv'),
]

for t, f in tables:
    imp(t, f)

print('\nDone.')
