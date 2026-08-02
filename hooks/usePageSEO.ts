import { useEffect, useState } from 'react';
import type { PageSEO } from '../types';
import { seoAPI } from '../services/api';

// P2-9: Sayfa bazlı SEO fetch — 8 sayfadaki duplike seoAPI.getPageSEO pattern'ini tekilleştirir
export function usePageSEO(path: string): PageSEO | null {
    const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);
    useEffect(() => {
        let cancelled = false;
        seoAPI.getPageSEO(path)
            .then((data) => { if (!cancelled) setPageSEO(data); })
            .catch(() => { /* SEO yoksa null kalır — sayfa çalışmaya devam eder */ });
        return () => { cancelled = true; };
    }, [path]);
    return pageSEO;
}
