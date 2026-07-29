// pg response fixer: res.json(varname) -> res.json(varname.rows) for db.query results
import { readFileSync, writeFileSync } from 'fs';

const fp = 'd:/repos/akayd-n-tar-m/server/index.js';
let t = readFileSync(fp, 'utf-8');

// Pattern: res.json(VARNAME) where VARNAME was from db.query
// We already renamed destructured vars. Now need to fix all res.json(...) calls.
// But only for variables that came from db.query, not for generic objects.

// Strategy: wrap all routes to auto-extract .rows from db.query results
// Actually simpler: find all lines with res.json(NAME) where NAME was destructured
// from db.query, and add .rows

// The destructured names from our conversion: rows, result, existing, totalRows, viewsRows, topRows,
// existingVisitor, existingSessions, checkAgain, latest, current, settings, activeVisitors,
// visitor, activeCount, todayUnique, currentPageViews, topReferrers, countries

const dbQueryVars = new Set([
  'rows', 'result', 'existing', 'totalRows', 'viewsRows', 'topRows',
  'existingVisitor', 'existingSessions', 'checkAgain', 'latest', 'current',
  'settings', 'activeVisitors', 'visitor', 'activeCount', 'todayUnique',
  'currentPageViews', 'topReferrers', 'countries', 'visitorTypes'
]);

for (const v of dbQueryVars) {
  // res.json(varname) -> res.json(varname.rows)
  t = t.replace(new RegExp(`res\\.json\\(${v}\\)`, 'g'), `res.json(${v}.rows)`);
  // res.json(varname[0]) -> keep as is (arrays not from db.query directly)
  // res.json({ ...varname }) -> don't touch
  // res.json({ id: result.rows[0].id, ... }) -> already fixed
}

// Also fix: res.json({ ... }) where varname[0] was already fixed to varname.rows[0]
// This should already be correct from our previous conversion

// Fix rows[0] that wasn't destructured (from non-destructured db.query)
// Pattern like: rows.rows (double) -> rows
t = t.replace(/\.rows\.rows/g, '.rows');

writeFileSync(fp, t, 'utf-8');
console.log('Fixed res.json calls');
