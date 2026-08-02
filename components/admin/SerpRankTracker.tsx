import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { serpAPI } from '../../services/api';
import type { SerpRankingCurrent, SerpKeyword, Notification } from '../../types';

const ENGINE_ICONS: Record<string, string> = { google: '🔴', yandex: '🟡', bing: '🔵' };
const ENGINE_LABELS: Record<string, string> = { google: 'Google', yandex: 'Yandex', bing: 'Bing' };

// Rakip takibi — rakip domain'leri keyword'ün domain alanına girilir, checkAllRankings hepsini kontrol eder
const DOMAINS = [
  { key: '', label: '🌐 Tümü' },
  { key: 'akaydintarim.com.tr', label: '🌿 Akaydın Tarım' },
  { key: 'hendekfindikkirma.com', label: '🥜 Hendek Fındık Kırma' },
  { key: 'sifafindik.com.tr', label: '⚔️ Şifa Fındık' },
  { key: 'durakfindik.com.tr', label: '⚔️ Durak Fındık' },
  { key: 'hazelfindik.com', label: '⚔️ Hazel Fındık' },
];

function getPositionColor(pos: number): string {
  if (pos === 0) return 'text-red-500';
  if (pos <= 3) return 'text-green-600';
  if (pos <= 10) return 'text-blue-600';
  if (pos <= 20) return 'text-yellow-600';
  return 'text-orange-500';
}

function getPositionBg(pos: number): string {
  if (pos === 0) return 'bg-red-50 border-red-200';
  if (pos <= 3) return 'bg-green-50 border-green-200';
  if (pos <= 10) return 'bg-blue-50 border-blue-200';
  if (pos <= 20) return 'bg-yellow-50 border-yellow-200';
  return 'bg-orange-50 border-orange-200';
}

interface SerpRankTrackerProps {
  addNotification?: (type: Notification['type'], title: string, message: string) => void;
}

// Dinamik rakip satırı (serp_competitors)
interface CompetitorRow {
  domain: string;
  keyword: string;
  engine: string;
  position: number;
  url?: string;
  checked_at: string;
  first_seen?: string;
  last_seen?: string;
  checks?: number;
  trend?: 'new' | 'up' | 'down' | 'same' | 'out';
  position_change?: number | null;
}

const SerpRankTracker: React.FC<SerpRankTrackerProps> = ({ addNotification }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'graphs' | 'table' | 'competitors'>('dashboard');
  const [activeDomain, setActiveDomain] = useState('');
  const [currentData, setCurrentData] = useState<SerpRankingCurrent[]>([]);
  const [keywords, setKeywords] = useState<SerpKeyword[]>([]);
  const [history, setHistory] = useState<SerpRankingCurrent[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([]);
  const [competitorsLoading, setCompetitorsLoading] = useState(false);

  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');
  const [selectedDays, setSelectedDays] = useState(30);

  // Rakip/keyword ekleme formu
  const [newKeyword, setNewKeyword] = useState('');
  const [newDomain, setNewDomain] = useState('akaydintarim.com.tr');

  const loadData = useCallback(async () => {
    try {
      const [current, kwList] = await Promise.all([
        serpAPI.getCurrent(activeDomain || undefined),
        serpAPI.getKeywords(),
      ]);
      setCurrentData(current);
      setKeywords(kwList);
      if (!selectedKeyword && kwList.length > 0) {
        setSelectedKeyword(kwList[0].keyword);
      }
    } catch (err) {
      console.error('SERP veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedKeyword, activeDomain]);

  const loadHistory = useCallback(async () => {
    if (!selectedKeyword) return;
    try {
      const data = await serpAPI.getHistory({
        keyword: selectedKeyword,
        engine: selectedEngine || undefined,
        days: selectedDays,
        domain: activeDomain || undefined,
      });
      setHistory(data);
    } catch (err) {
      console.error('SERP geçmiş yükleme hatası:', err);
    }
  }, [selectedKeyword, selectedEngine, selectedDays, activeDomain]);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadData(); }, [activeDomain]);

  useEffect(() => {
    if (activeTab === 'graphs') loadHistory();
  }, [activeTab, loadHistory]);

  useEffect(() => {
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Dinamik rakip listesi yükle
  const loadCompetitors = useCallback(async () => {
    setCompetitorsLoading(true);
    try {
      const data = await serpAPI.getCompetitors({ days: selectedDays, keyword: selectedKeyword || undefined });
      setCompetitors(data);
    } catch (err) {
      console.error('Rakip listesi yükleme hatası:', err);
    } finally {
      setCompetitorsLoading(false);
    }
  }, [selectedDays, selectedKeyword]);

  useEffect(() => {
    if (activeTab === 'competitors') loadCompetitors();
  }, [activeTab, loadCompetitors]);

  // Keyword + domain ekle (rakip takibi için rakip domain seçilebilir)
  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    try {
      await serpAPI.addKeyword(newKeyword.trim(), newDomain);
      setNewKeyword('');
      addNotification?.('success', 'Eklendi', `"${newKeyword.trim()}" takibe alındı (${newDomain})`);
      loadData();
    } catch (err) {
      addNotification?.('error', 'Hata', 'Keyword eklenirken hata oluştu.');
    }
  };

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      await serpAPI.triggerCheck();
      addNotification?.('success', 'Kontrol Başlatıldı', 'Tüm keyword\'ler için SERP kontrolü başlatıldı.');
      setTimeout(() => { loadData(); setChecking(false); }, 5000);
    } catch {
      addNotification?.('error', 'Hata', 'SERP kontrolü başlatılamadı.');
      setChecking(false);
    }
  };

  const groupedData: Record<string, Record<string, SerpRankingCurrent>> = {};
  for (const row of currentData) {
    const domainKey = row.domain || 'akaydintarim.com.tr';
    const key = `${row.keyword}@${domainKey}`;
    if (!groupedData[key]) groupedData[key] = {};
    groupedData[key][row.engine] = row;
  }

  const chartDataMap: Record<string, { date: string; [engine: string]: number | string }> = {};
  for (const row of history) {
    const date = new Date(row.checked_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    if (!chartDataMap[date]) chartDataMap[date] = { date };
    chartDataMap[date][row.engine] = row.position === 0 ? null as unknown as number : row.position;
  }
  const chartData = Object.values(chartDataMap);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Build keyword+domain list from current data
  // Fix: Set referans eşitliği kullanır — obje array'i dedupe etmez → 3 engine 3 ayrı satır görünürdü.
  // String anahtar + Map ile gerçek keyword@domain dedup.
  const keywordDomainPairs = [...new Map(currentData.map(r => {
    const domain = r.domain || 'akaydintarim.com.tr';
    const key = `${r.keyword}@${domain}`;
    return [key, { keyword: r.keyword, domain }];
  })).values()];

  return (
    <div className="space-y-6">
      {/* Domain Tabs */}
      <div className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
        {DOMAINS.map(d => (
          <button
            key={d.key}
            onClick={() => setActiveDomain(d.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeDomain === d.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Keyword + Rakip Ekleme */}
      <form onSubmit={handleAddKeyword} className="flex flex-wrap gap-2 bg-white rounded-lg p-3 shadow-sm items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Anahtar Kelime</label>
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="örn. fındık kırma hendek"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Takip Edilecek Site</label>
          <select
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {DOMAINS.filter(d => d.key).map(d => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all"
        >
          ➕ Ekle
        </button>
      </form>

      {/* Sub Tabs + Manual Check */}
      <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
        {[
          { id: 'dashboard' as const, label: '📊 Dashboard' },
          { id: 'graphs' as const, label: '📈 Grafikler' },
          { id: 'table' as const, label: '📋 Detay Tablo' },
          { id: 'competitors' as const, label: '⚔️ Rakip Analizi' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={handleManualCheck}
          disabled={checking}
          className="px-4 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {checking ? '⏳ Kontrol...' : '🔄 Şimdi Kontrol Et'}
        </button>
      </div>

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-2">📊 Arama Motoru Sıralama Takibi</h2>
            <p className="text-blue-100">
              {keywords.length} anahtar kelime Google, Yandex ve Bing'de takip ediliyor.
              {activeDomain && <> — Alan: <strong>{activeDomain}</strong></>}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {keywordDomainPairs.map(pair => {
              const key = `${pair.keyword}@${pair.domain}`;
              const engines = groupedData[key] || {};
              const lastCheck = Object.values(engines)[0]?.checked_at;
              const bestPos = Math.min(...Object.values(engines).map(e => e.position === 0 ? 999 : e.position));

              return (
                <div key={key} className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{pair.keyword}</h3>
                      <span className="text-xs text-gray-400">{pair.domain}</span>
                    </div>
                    {bestPos < 999 && (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPositionBg(bestPos)} ${getPositionColor(bestPos)} border`}>
                        En İyi: #{bestPos}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['google', 'yandex', 'bing'].map(eng => {
                      const data = engines[eng];
                      return (
                        <div key={eng} className={`rounded-lg p-3 border text-center ${data ? getPositionBg(data.position) : 'bg-gray-50 border-gray-200'}`}>
                          <div className="text-lg mb-1">{ENGINE_ICONS[eng]}</div>
                          <div className="text-xs text-gray-500 mb-1">{ENGINE_LABELS[eng]}</div>
                          <div className={`text-xl font-bold ${data ? getPositionColor(data.position) : 'text-gray-400'}`}>
                            {data && data.position > 0 ? `#${data.position}` : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {lastCheck && (
                    <div className="mt-3 text-xs text-gray-400 text-right">
                      Son kontrol: {new Date(lastCheck).toLocaleString('tr-TR')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GRAPHS */}
      {activeTab === 'graphs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anahtar Kelime</label>
                <select value={selectedKeyword} onChange={e => setSelectedKeyword(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {keywords.map(kw => (<option key={kw.id} value={kw.keyword}>{kw.keyword}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arama Motoru</label>
                <select value={selectedEngine} onChange={e => setSelectedEngine(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Tümü</option>
                  <option value="google">Google</option>
                  <option value="yandex">Yandex</option>
                  <option value="bing">Bing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zaman Aralığı</label>
                <select value={selectedDays} onChange={e => setSelectedDays(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value={7}>7 gün</option><option value={14}>14 gün</option><option value={30}>30 gün</option><option value={90}>90 gün</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sıralama Geçmişi — "{selectedKeyword}"</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis reversed domain={[1, 50]} tick={{ fontSize: 12 }} label={{ value: 'Pozisyon', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => [value ? `#${value}` : 'Sıralama dışı', '']} labelFormatter={(label) => `Tarih: ${label}`} />
                  <Legend />
                  {(!selectedEngine || selectedEngine === 'google') && <Line type="monotone" dataKey="google" stroke="#EA4335" strokeWidth={2} dot={{ r: 3 }} name="Google" connectNulls={false} />}
                  {(!selectedEngine || selectedEngine === 'yandex') && <Line type="monotone" dataKey="yandex" stroke="#FFCC00" strokeWidth={2} dot={{ r: 3 }} name="Yandex" connectNulls={false} />}
                  {(!selectedEngine || selectedEngine === 'bing') && <Line type="monotone" dataKey="bing" stroke="#008AD7" strokeWidth={2} dot={{ r: 3 }} name="Bing" connectNulls={false} />}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">Henüz yeterli veri yok.</p>
                <p className="text-sm mt-2">İlk kontrol sonrası grafik burada görünecek.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TABLE */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anahtar Kelime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Google</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Yandex</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Bing</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">En İyi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Son Kontrol</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keywordDomainPairs.map(pair => {
                  const key = `${pair.keyword}@${pair.domain}`;
                  const engines = groupedData[key] || {};
                  const positions = {
                    google: engines['google']?.position || 0,
                    yandex: engines['yandex']?.position || 0,
                    bing: engines['bing']?.position || 0,
                  };
                  const bestPos = Math.min(...Object.values(positions).map(p => p === 0 ? 999 : p));
                  const lastCheck = Object.values(engines)[0]?.checked_at;

                  return (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{pair.keyword}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pair.domain}</td>
                      {(['google', 'yandex', 'bing'] as const).map(eng => (
                        <td key={eng} className="px-6 py-4 whitespace-nowrap text-center">
                          {positions[eng] > 0 ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${getPositionBg(positions[eng])} ${getPositionColor(positions[eng])} border`}>#{positions[eng]}</span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {bestPos < 999 ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${getPositionBg(bestPos)} ${getPositionColor(bestPos)} border`}>#{bestPos}</span>
                        ) : (
                          <span className="text-sm text-red-400">Sıralama dışı</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {lastCheck ? new Date(lastCheck).toLocaleString('tr-TR') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ⚔️ RAKİP ANALİZİ — dinamik tespit (serp_competitors) */}
      {activeTab === 'competitors' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">⚔️ Dinamik Rakip Analizi</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Her kontrolde SERP ilk 10'u otomatik taranır — rakip domain'leri senin girmene gerek kalmadan kaydedilir.
                  <span className="font-medium text-gray-700"> Yeni giren</span>, <span className="font-medium text-gray-700">çıkan</span> ve <span className="font-medium text-gray-700">sırası değişen</span> rakipler burada.
                </p>
              </div>
              <button
                onClick={loadCompetitors}
                disabled={competitorsLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {competitorsLoading ? '⏳ Yükleniyor...' : '🔄 Yenile'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {competitorsLoading ? (
              <div className="p-8 text-center text-gray-500">Rakip verileri yükleniyor...</div>
            ) : competitors.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Henüz rakip verisi yok. İlk SERP kontrolünden sonra burada görünür.
                <br />
                <span className="text-sm text-gray-400">Not: Rakipler scraping ile tespit edilir — Google CAPTCHA'ya takılırsa pozisyonlar boş kalabilir.</span>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rakip Site</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Motor</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pozisyon</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trend</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">İlk Görülme</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Kontrol Sayısı</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Son Kontrol</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {competitors.map((c, i) => (
                    <tr key={`${c.domain}-${c.keyword}-${c.engine}-${i}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800">
                          {c.domain}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.keyword}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{ENGINE_ICONS[c.engine] || c.engine}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {c.position > 0 ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${getPositionBg(c.position)} ${getPositionColor(c.position)} border`}>#{c.position}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {c.trend === 'new' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">🆕 Yeni</span>}
                        {c.trend === 'up' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">▲ +{c.position_change}</span>}
                        {c.trend === 'down' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">▼ {c.position_change !== null ? c.position_change : ''}</span>}
                        {c.trend === 'same' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">= Sabit</span>}
                        {c.trend === 'out' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">Çıktı</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {c.first_seen ? new Date(c.first_seen).toLocaleDateString('tr-TR') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">{c.checks || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {c.checked_at ? new Date(c.checked_at).toLocaleString('tr-TR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SerpRankTracker;
