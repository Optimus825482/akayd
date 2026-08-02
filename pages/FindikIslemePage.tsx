import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ContactPageContent, SEOSettings } from '../types';
import SEOHead from '../components/SEOHead';
import { usePageSEO } from '../hooks/usePageSEO';

const seoFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Fındık kırma işlemi ne kadar sürer?", "acceptedAnswer": { "@type": "Answer", "text": "Parti büyüklüğüne bağlı olarak 100 kg kabuklu fındık yaklaşık 1-2 saat içinde işlenir. Günlük 5 ton kapasitemiz mevcuttur." } },
    { "@type": "Question", "name": "Fındık kırma ve kavurma fiyatları nedir?", "acceptedAnswer": { "@type": "Answer", "text": "Güncel fiyatlar için bizi arayın: +90 539 775 1517. Rekabetçi fiyatlarla hizmet vermekteyiz." } },
    { "@type": "Question", "name": "Hendek'te fındık kırma hizmeti veriyor musunuz?", "acceptedAnswer": { "@type": "Answer", "text": "Evet, Hendek merkezde bulunan tesisimizde profesyonel fındık kırma, kavurma ve vakumlu paketleme hizmeti sunuyoruz." } },
    { "@type": "Question", "name": "Kavrulmuş fındık nasıl saklanmalı?", "acceptedAnswer": { "@type": "Answer", "text": "Vakumlu paketlediğimiz kavrulmuş fındık, serin ve kuru ortamda 6 aya kadar tazeliğini korur. Açıldıktan sonra buzdolabında saklanması önerilir." } },
    { "@type": "Question", "name": "Fındık işleme için randevu gerekiyor mu?", "acceptedAnswer": { "@type": "Answer", "text": "Yoğun sezonda randevu önerilir. Diğer zamanlarda doğrudan tesisimize getirebilirsiniz. WhatsApp hattımızdan kolayca randevu alabilirsiniz." } }
  ]
};

const seoFaqItems = seoFaqSchema.mainEntity.map(item => ({
  q: item.name,
  a: item.acceptedAnswer.text
}));

interface FindikIslemePageProps { contactContent: ContactPageContent; seoSettings?: SEOSettings | null; }

/* ──────────────── DATA ──────────────── */

const steps = [
  {
    n: '01', t: 'Kabul & Tartım',
    d: 'Kabuklu fındığınızı teslim alıyor, miktar ve genel durum değerlendirmesi yapıyoruz. Fındığın nem oranı, çürük/bozuk oranı kontrol edilir.',
    extra: 'Teslim fişi düzenlenir, işlem süresi ve teslim tarihi karşılıklı teyit edilir.',
  },
  {
    n: '02', t: 'Temizleme & Eleme',
    d: 'Yaprak, dal, toprak, taş ve diğer yabancı maddelerden arındırılır. Çift elekli sistem ile boş ve çürük fındıklar ayrıştırılır.',
    extra: 'Bu aşama randımanı doğrudan etkiler; temizlenmemiş fındıkta %5-10 fire normaldir.',
  },
  {
    n: '03', t: 'Boyutlandırma',
    d: 'Fındıklar profesyonel kalibrasyon makinesinde 3-4 farklı boyuta ayrılır. Her boyut için kırma makinesi ayrı kalibre edilir.',
    extra: 'Doğru boyutlandırma, iç fındığın hasarsız çıkma oranını %90\'dan %98\'e yükseltir.',
  },
  {
    n: '04', t: 'Profesyonel Kırma',
    d: 'Her boyut grubu için optimize edilmiş basınç ayarlarıyla, özel alaşımlı kırma tamburunda kabuklar hasarsız şekilde açılır.',
    extra: 'Geleneksel yöntemlere göre 10 kata kadar daha hızlı; saatte 5-10 kg kapasite.',
  },
  {
    n: '05', t: 'Hava Akımıyla Ayırma',
    d: 'Güçlü ve ayarlanabilir fan sistemiyle hafif kabuk parçaları emilir, ağır iç fındıklar aşağıya düşerek ayrılır. Çift kademeli filtreleme.',
    extra: 'Bu sistem sayesinde iç fındıkta kabuk kalıntısı %0.3\'ün altına düşer.',
  },
  {
    n: '06', t: 'Son Kontrol & Paketleme',
    d: 'El değmeden bant üzerinde son kalite kontrolü yapılır. Onaylanan fındıklar vakumlu paketleme ile hava almaz şekilde mühürlenir.',
    extra: 'Vakumlu paket serin ve kuru ortamda 2 yıla kadar tazeliğini korur.',
  },
];

const advantages = [
  { icon: '🏆', t: 'Hendek\'te İlk ve Tek', d: 'Hendek merkezde ev kullanıcılarına profesyonel fındık kırma hizmeti sunan ilk firmayız.' },
  { icon: '🔬', t: 'Son Teknoloji Makine', d: 'Elektronik kontrollü, ayarlanabilir basınçlı, hijyenik paslanmaz çelik işleme hattı.' },
  { icon: '💎', t: 'Maksimum Randıman', d: 'Boyuta özel kalibrasyonla iç fındık hasar oranı %2\'nin altında. Değeriniz korunur.' },
  { icon: '🛡️', t: 'Çürüme Riskine Son', d: 'Kabuklu bekletmede oluşan küf, acılaşma ve böceklenme riskini tamamen ortadan kaldırıyoruz.' },
  { icon: '📦', t: 'Profesyonel Vakumlama', d: 'Endüstriyel vakum makinesiyle oksijensiz paketleme; serin ortamda 24 aya kadar tazelik.' },
  { icon: '⚡', t: 'Hızlı ve Esnek Teslimat', d: 'Hendek ve çevre ilçelere aynı gün teslim. Acil işler için öncelikli işleme seçeneği.' },
];

const machineSpecs = [
  { label: 'Marka/Model', value: 'Endüstriyel Tip Kırma Hattı' },
  { label: 'Kırma Kapasitesi', value: '5–10 kg/saat (boyuta göre)' },
  { label: 'Kırma Tamburu', value: 'Sertleştirilmiş krom-nikel alaşım' },
  { label: 'Boyutlandırma', value: '3–4 kalibre (elektronik kontrollü)' },
  { label: 'Hava Ayırma', value: 'Çift kademeli, ayarlanabilir fan' },
  { label: 'Vakum Makinesi', value: 'Endüstriyel, çift ısıtma çubuklu' },
  { label: 'Gövde Malzemesi', value: 'Gıdaya uygun 304 paslanmaz çelik' },
  { label: 'Güç Tüketimi', value: '220V ev tipi priz, ~1.5 kW' },
];

const faq = [
  {
    q: 'Ne kadar fındık getirmeliyim?',
    a: 'Minimum miktar sınırımız yoktur. 1 kg\'dan 500 kg\'a kadar her miktarda fındığınızı işleyebiliriz. 50 kg üzeri işlemler için lütfen önceden randevu alınız.',
  },
  {
    q: 'İşlem süresi ne kadar?',
    a: 'Makine kapasitemiz saatte 5-10 kg\'dır. 20 kg\'lık bir parti yaklaşık 2-3 saatte işlenir. Yoğunluğa göre teslimat süresi değişebilir, teslim anında net bilgi verilir.',
  },
  {
    q: 'Fındığım kırılırken içi zarar görür mü?',
    a: 'Hayır. Her boyut grubu için ayrı kalibre edilen profesyonel kırma tamburumuz sayesinde iç fındık hasar oranı %2\'nin altındadır. Geleneksel yöntemlerde bu oran %15-20\'ye kadar çıkabilir.',
  },
  {
    q: 'Kabuklar ne oluyor?',
    a: 'Dilerseniz kabuklarınızı geri alabilirsiniz (bahçede malç, soba yakıtı vb. için). İstemediğiniz takdirde bertarafını biz üstleniyoruz.',
  },
  {
    q: 'Vakumlu paketleme ücretli mi?',
    a: 'Tüm işlemlerimize vakumlu paketleme dahildir. Ayrıca ücret talep edilmez. Standart olarak 1 kg\'lık vakum poşetleri kullanılır, isteğe bağlı farklı gramaj seçenekleri mevcuttur.',
  },
  {
    q: 'Hangi bölgelere hizmet veriyorsunuz?',
    a: 'Hendek merkez ve tüm mahallelerine teslimat yapıyoruz. Sakarya merkez, Akyazı, Karasu, Kocaali ve Düzce\'nin yakın bölgelerine de anlaşmalı olarak hizmet vermekteyiz.',
  },
  {
    q: 'Fındıklarımı ne zaman teslim edebilirim?',
    a: 'Haftanın 6 günü (Pazartesi-Cumartesi) 08:00-18:00 saatleri arasında teslim alıyoruz. Acil işler için telefonla özel randevu alabilirsiniz.',
  },
  {
    q: 'Ödemeyi nasıl yapabilirim?',
    a: 'Nakit, havale/EFT veya kapıda ödeme seçenekleri mevcuttur. Kurumsal müşteriler için fatura kesilmektedir.',
  },
];

const hygieneStandards = [
  { icon: '🧤', t: 'Temassız İşleme', d: 'Kabulden paketlemeye kadar hiçbir aşamada el teması yoktur. Tamamen kapalı hat.' },
  { icon: '🧼', t: 'Gıda Onaylı Ekipman', d: 'Tüm makine aksamı 304 kalite paslanmaz çelikten imal edilmiştir. Gıda kodeksine uygundur.' },
  { icon: '🧹', t: 'Her Parti Sonrası Temizlik', d: 'Her müşteri partisi sonrası makine komple temizlenir; çapraz bulaşma riski sıfırdır.' },
  { icon: '📋', t: 'İşlem Kaydı', d: 'Her parti için işlem fişi düzenlenir; giriş miktarı, fire oranı ve çıkış miktarı kayıt altına alınır.' },
];

const comparisonData = [
  { kriter: 'İç Fındık Hasarı', evde: '%15-20', profesyonel: '< %2', better: 'profesyonel' },
  { kriter: 'İşlem Süresi (20 kg)', evde: '2-3 gün', profesyonel: '2-3 saat', better: 'profesyonel' },
  { kriter: 'Kabuk Ayırma', evde: 'Elle, zahmetli', profesyonel: 'Hava akımı, otomatik', better: 'profesyonel' },
  { kriter: 'Hijyen', evde: 'Değişken', profesyonel: 'Gıda onaylı hat', better: 'profesyonel' },
  { kriter: 'Paketleme', evde: 'Poşet/bez torba', profesyonel: 'Vakumlu, 2 yıl tazelik', better: 'profesyonel' },
  { kriter: 'Fire Oranı', evde: '%10-25', profesyonel: '< %5', better: 'profesyonel' },
  { kriter: 'Zaman Esnekliği', evde: 'Kendi zamanınız', profesyonel: 'Randevulu, planlı', better: 'evde' },
];

const seasonInfo = [
  { month: 'Ağustos-Eylül', phase: 'Hasat Sezonu', desc: 'En yoğun dönem. Taze fındıkların işlenmesi için ideal zaman. Yoğunluk nedeniyle 2-3 gün önceden randevu önerilir.', color: '#1a6532' },
  { month: 'Ekim-Kasım', phase: 'Kuruma & Dinlendirme', desc: 'Fındıkların nem oranı düşer, kırma randımanı yükselir. İşleme için en uygun dönemdir.', color: '#b45309' },
  { month: 'Aralık-Şubat', phase: 'Kış Sezonu', desc: 'Düşük yoğunluk, hızlı teslimat. Soğuk hava fındık kalitesini korur. Kış aylarında çalışma saatleri kısalabilir.', color: '#1e40af' },
  { month: 'Mart-Temmuz', phase: 'Bakım & Stok Dönemi', desc: 'Yeni sezon öncesi bakım dönemi. Elde kalan stok fındıkların işlenmesi için son fırsat.', color: '#7c3aed' },
];

const galleryImages = [
  { src: '/placeholder.svg', alt: 'Fındık kırma makinesi ön görünüm', label: 'Kırma Hattı' },
  { src: '/placeholder.svg', alt: 'Boyutlandırma ünitesi', label: 'Kalibrasyon' },
  { src: '/placeholder.svg', alt: 'Vakum paketleme makinesi', label: 'Vakumlama' },
  { src: '/placeholder.svg', alt: 'İşlenmiş hazır fındık', label: 'Sonuç' },
];

/* ──────────────── COMPONENT ──────────────── */

const FindikIslemePage: React.FC<FindikIslemePageProps> = ({ contactContent, seoSettings }) => {
  const pageSEO = usePageSEO('/findik-isleme');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openSeoFaq, setOpenSeoFaq] = useState<number | null>(null);

  const wp = contactContent.whatsapp_phone || contactContent.phone?.replace(/[^\d]/g, '') || '905397751517';

  // ═══════════ SCHEMA MARKUP ═══════════
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Hendek Fındık Kırma & İşleme Süreci",
    "description": "6 aşamalı profesyonel fındık işleme süreci: kabul, temizleme, boyutlandırma, kırma, hava akımıyla ayırma ve son kontrol-paketleme.",
    "step": steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.t,
      "text": s.d + " " + s.extra
    }))
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.akaydintarim.com.tr/#localbusiness",
    "name": "Akaydın Tarım - Hendek Fındık Kırma & İşleme",
    "description": "Hendek, Sakarya'da ev tipi fındık kırma, kavurma ve vakumlu paketleme hizmeti. Saatte 5-10 kg kapasite, %98 hasarsız iç fındık.",
    "image": "https://www.akaydintarim.com.tr/akaylogo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": contactContent.address?.split(',').slice(0, 2).join(',').trim() || "Remzi Efendi Cd. No:24",
      "addressLocality": "Hendek",
      "addressRegion": "Sakarya",
      "postalCode": "54300",
      "addressCountry": "TR"
    },
    "telephone": contactContent.phone || "+902641234567",
    "priceRange": "₺₺",
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "08:00", "closes": "18:00" }
    ],
    "areaServed": { "@type": "City", "name": "Hendek, Sakarya" }
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Hendek Fındık Kırma, Kavurma ve Vakumlu Paketleme Hizmeti",
    "description": "Hendek, Sakarya'da profesyonel fındık kırma, kavurma ve vakumlu paketleme. Saatte 5-10 kg kapasite, %98 hasarsız iç fındık.",
    "brand": { "@type": "Brand", "name": "Akaydın Tarım" },
    "category": "AgriculturalService",
    "areaServed": { "@type": "City", "name": "Hendek" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "TRY",
      "availability": "https://schema.org/InStock",
      "areaServed": { "@type": "City", "name": "Hendek, Sakarya" }
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Fındık Kırma, Kavurma ve Vakumlu Paketleme",
    "provider": { "@type": "LocalBusiness", "name": "Akaydın Tarım", "@id": "https://www.akaydintarim.com.tr/#localbusiness" },
    "areaServed": { "@type": "City", "name": "Hendek, Sakarya" },
    "description": "Kabuklu fındığın profesyonel ekipmanla kırılması, kavrulması ve vakumlu paketlenmesi. Ev tipi miktarlar kabul edilir.",
    "serviceType": "Fındık İşleme Hizmeti",
    "termsOfService": "https://www.akaydintarim.com.tr/#/findik-isleme",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Fındık İşleme Hizmetleri",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Fındık Kırma" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Fındık Kavurma" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Vakumlu Paketleme" } }
      ]
    }
  };

  const greenGradient = { background: 'linear-gradient(135deg, #0f1f10 0%, #142218 60%, #1a2a1a 100%)' };

  return (<>
    <SEOHead seoSettings={seoSettings || undefined} pageSEO={pageSEO || undefined}
      pageTitle="Hendek Fındık Kırma & Kavurma | Vakumlu Paketleme | Akaydın Tarım"
      pageDescription="Hendek'te fındık kırma, kavurma ve vakumlu paketleme hizmeti. Saatte 10 kg kapasite, %98 hasarsız iç fındık. Hendek fındık kırma kavurma vakumlu paketleme için hemen arayın: 0539 775 15 17"
      pageKeywords="hendek fındık kırma, hendek fındık kavurma, hendek fındık, fındık kırma kavurma, hendek fındık kavurma paketleme, fındık kırma kavurma vakumlu paketleme, vakumlu paketleme hendek, fındık işleme sakarya, ev tipi fındık kırma, fındık kavurma hizmeti"
      structuredData={[faqSchema, howToSchema, localBusinessSchema, productSchema, serviceSchema]}
      breadcrumbItems={[
        { name: 'Ana Sayfa', url: (seoSettings?.canonical_url || 'https://www.akaydintarim.com.tr') + '/' },
        { name: 'Fındık İşleme', url: (seoSettings?.canonical_url || 'https://www.akaydintarim.com.tr') + '/findik-isleme' }
      ]} />

    {/* ═══════════ HERO ═══════════ */}
    <section className="relative py-20 md:py-28 overflow-hidden" style={greenGradient}>
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}></div>
      <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full opacity-8 blur-3xl" style={{ background: '#1a6532' }}></div>
      <div className="container relative z-10">
        <p className="text-accent-bg/60 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Hendek • Sakarya</p>
        <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-display)] font-bold text-white mb-4">
          Hendek Fındık Kırma<br /><span style={{ color: 'oklch(80% 0.12 142)' }}>& Kavurma Hizmeti</span>
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mb-3">
          Hendek ve Sakarya'da <strong>fındık kırma ve kavurma</strong> hizmeti. Kabuklu fındığın profesyonel ekipmanla işlenmesi, hijyenik ortamda vakumlu paketleme. Ev tipi fındık işleme için Hendek'in güvenilir adresi.
        </p>
        <p className="text-sm text-white/40 max-w-xl mb-10">
          Haftanın 6 günü hizmet • Saatte 5-10 kg kapasite • %98+ hasarsız iç fındık • Vakumlu paketleme dahil • Hendek merkez
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={`https://wa.me/${wp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-primary btn-lg" style={{ background: '#1a6532', color: '#fff' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
            WhatsApp'tan Bilgi Al
          </a>
          <a href={`tel:${contactContent.phone}`} className="btn btn-outline btn-lg border-white/20 text-white hover:bg-white/10">
            📞 {contactContent.phone}
          </a>
        </div>
      </div>
    </section>

    {/* ═══════════ AVANTAJLAR ═══════════ */}
    <section className="section bg-surface">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Neden Biz</p>
          <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-ink">6 önemli avantaj</h2>
          <p className="text-ink-2 max-w-xl mx-auto mt-3">Evde fındık kırmak zahmetli ve fire oranı yüksektir. Profesyonel ekipmanla bu sorunları ortadan kaldırıyoruz.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((a) => (
            <div key={a.t} className="group p-6 rounded-2xl border border-rule hover:border-accent hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{a.icon}</div>
              <h3 className="text-lg font-bold text-ink mb-2">{a.t}</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{a.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════ İŞLEM SÜRECİ — TIMELINE ═══════════ */}
    <section className="section bg-paper-2">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">İşlem Süreci</p>
          <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">6 aşamalı hijyenik işlem</h2>
          <p className="text-ink-2 max-w-xl mx-auto">Kabuklu fındığın kabulünden vakumlu pakete uzanan yolculuğun her aşaması titizlikle yönetilir.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {steps.map((s) => (
            <div key={s.n} className="group flex items-start gap-6 p-6 rounded-2xl bg-surface border border-rule hover:border-accent/30 transition-colors">
              <div className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: '#1a6532' }}>{s.n}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-ink mb-1">{s.t}</h3>
                <p className="text-sm text-ink-2 leading-relaxed">{s.d}</p>
                <p className="text-xs text-accent mt-2 italic">💡 {s.extra}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════ HENDEK FINDIK KAVURMA PAKETLEME ═══════════ */}
    <section className="section bg-paper-2">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Kavurma & Paketleme</p>
          <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Hendek Fındık Kavurma ve Paketleme Hizmeti</h2>
          <p className="text-ink-2 max-w-xl mx-auto">
            Kırma işleminin ardından fındıklarınızı profesyonel ekipmanla <strong>kavurup vakumlu paketliyoruz</strong>. Hendek fındık kavurma paketleme hizmetimizle fındıklarınız uzun süre taze kalır.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: '🔥', t: 'Profesyonel Kavurma', d: 'Endüstriyel kavurma fırınında, istenen kıvamda homojen kavurma. Az, orta veya çok kavrulmuş seçenekleri mevcuttur.' },
            { icon: '📦', t: 'Vakumlu Paketleme', d: 'Kavrulan fındıklar hava almaz vakum poşetlerinde paketlenir. Serin ortamda 24 aya kadar tazelik garantisi.' },
            { icon: '🏠', t: 'Ev Tipi Miktarlar', d: '1 kg\'dan itibaren her miktarda kavurma ve paketleme hizmeti. Kendi fındığınızı getirin, kavrulmuş ve paketlenmiş alın.' },
          ].map((item) => (
            <div key={item.t} className="group p-6 rounded-2xl bg-surface border border-rule hover:border-accent hover:shadow-md transition-all duration-300">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-lg font-bold text-ink mb-2">{item.t}</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════ FINDIK KIRMA KAVURMA VAKUMLU PAKETLEME — DETAY ═══════════ */}
    <section className="section bg-surface">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Komple Hizmet</p>
          <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">
            Fındık Kırma, Kavurma ve Vakumlu Paketleme
          </h2>
          <p className="text-ink-2 max-w-xl mx-auto">
            Tek elden <strong>fındık kırma kavurma vakumlu paketleme</strong> hizmeti ile fındıklarınız zahmetsizce sofraya hazır hale gelir. Hendek'te komple fındık işleme çözümü.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-paper-2 border border-rule">
              <h3 className="font-bold text-ink mb-3 text-lg">📋 Paket İçeriği</h3>
              <ul className="space-y-2 text-sm text-ink-2">
                <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> Kabuklu fındığın teslim alınması ve tartım</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> Profesyonel makinede boyuta göre kırma</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> Hava akımıyla kabuk ve iç fındık ayrıştırma</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> Endüstriyel fırında istenen kıvamda kavurma</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> Vakumlu paketleme (1 kg'lık poşetler)</li>
                <li className="flex items-start gap-2"><span className="text-accent mt-0.5">✓</span> Son kontrol ve hijyenik teslimat</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-paper-2 border border-rule">
              <h3 className="font-bold text-ink mb-3 text-lg">💡 Neden Tek Elden?</h3>
              <ul className="space-y-3 text-sm text-ink-2">
                <li className="flex items-start gap-2"><span className="text-accent font-bold">01</span> Farklı yerlere taşıma zahmeti ortadan kalkar</li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold">02</span> İşlemler arası bekleme süresi olmaz</li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold">03</span> Toplu işlem avantajıyla daha uygun maliyet</li>
                <li className="flex items-start gap-2"><span className="text-accent font-bold">04</span> Tüm süreç tek elden takip edilir, fire minimize edilir</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-xs text-ink-3">
            Hendek fındık kırma kavurma vakumlu paketleme • Profesyonel ekipman • %98 hasarsız iç fındık • Aynı gün teslimat
          </p>
        </div>
      </div>
    </section>

    {/* ═══════════ MAKİNE TEKNİK ÖZELLİKLERİ ═══════════ */}
    <section className="section bg-surface">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Ekipman</p>
          <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Makine Teknik Özellikleri</h2>
          <p className="text-ink-2 max-w-xl mx-auto">Gıdaya uygun, endüstriyel standartlarda işleme hattımızın teknik detayları.</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-rule overflow-hidden">
            <table className="w-full">
              <tbody>
                {machineSpecs.map((spec, i) => (
                  <tr key={spec.label} className={i % 2 === 0 ? 'bg-surface' : 'bg-paper-2'}>
                    <td className="px-6 py-3.5 text-sm font-semibold text-ink border-r border-rule w-1/3">{spec.label}</td>
                    <td className="px-6 py-3.5 text-sm text-ink-2">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    {/* ═══════════ EVDE vs PROFESYONEL KARŞILAŞTIRMA ═══════════ */}
    <section className="section bg-paper-2">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Karşılaştırma</p>
          <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Evde Kırma vs Profesyonel Hizmet</h2>
          <p className="text-ink-2 max-w-xl mx-auto">Geleneksel yöntemlerle profesyonel işleme arasındaki farkı rakamlarla görün.</p>
        </div>
        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full rounded-2xl border border-rule overflow-hidden">
            <thead>
              <tr style={{ background: '#1a6532' }} className="text-white">
                <th className="px-6 py-3.5 text-left text-sm font-semibold">Kriter</th>
                <th className="px-6 py-3.5 text-center text-sm font-semibold">🏠 Evde</th>
                <th className="px-6 py-3.5 text-center text-sm font-semibold">⚙️ Profesyonel</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <tr key={row.kriter} className={i % 2 === 0 ? 'bg-surface' : 'bg-paper-2'}>
                  <td className="px-6 py-3 text-sm font-medium text-ink border-r border-rule">{row.kriter}</td>
                  <td className={`px-6 py-3 text-sm text-center border-r border-rule ${row.better === 'evde' ? 'text-accent font-semibold' : 'text-ink-2'}`}>
                    {row.evde} {row.better === 'evde' && '✓'}
                  </td>
                  <td className={`px-6 py-3 text-sm text-center ${row.better === 'profesyonel' ? 'text-accent font-semibold' : 'text-ink-2'}`}>
                    {row.profesyonel} {row.better === 'profesyonel' && '✓'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-ink-3 mt-3 text-center">✓ işareti o kriter için avantajlı seçeneği gösterir.</p>
        </div>
      </div>
    </section>

    {/* ═══════════ HİJYEN & KALİTE ═══════════ */}
    <section className="section bg-surface">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Hijyen Standardı</p>
          <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Gıda Güvenliği Önceliğimiz</h2>
          <p className="text-ink-2 max-w-xl mx-auto">İşleme hattımız gıda kodeksine uygun olarak tasarlanmıştır. Her aşamada hijyen standartlarına uyulur.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hygieneStandards.map((h) => (
            <div key={h.t} className="text-center p-6 rounded-2xl border border-rule hover:border-accent/30 transition-colors">
              <div className="text-4xl mb-3">{h.icon}</div>
              <h4 className="text-base font-bold text-ink mb-2">{h.t}</h4>
              <p className="text-sm text-ink-2 leading-relaxed">{h.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════ SEZON TAKVİMİ ═══════════ */}
    <section className="section bg-paper-2">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Fındık Takvimi</p>
          <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Sezon Bazında İşleme Rehberi</h2>
          <p className="text-ink-2 max-w-xl mx-auto">Yılın her döneminde hizmetinizdeyiz. Hangi ayda neye dikkat etmeniz gerektiğini öğrenin.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {seasonInfo.map((s) => (
            <div key={s.month} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-surface border border-rule hover:border-accent/20 transition-colors">
              <div className="sm:w-40 shrink-0 text-center sm:text-left">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: s.color }}>{s.month}</span>
              </div>
              <div className="hidden sm:block w-px h-10 bg-rule"></div>
              <div className="flex-1">
                <h4 className="font-bold text-ink text-sm mb-1">{s.phase}</h4>
                <p className="text-xs text-ink-2 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════ SSS ═══════════ */}
    <section className="section bg-surface">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Merak Edilenler</p>
          <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">Sıkça Sorulan Sorular</h2>
          <p className="text-ink-2 max-w-xl mx-auto">Fındık işleme hizmetimiz hakkında en çok merak edilen soruların cevapları.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faq.map((item, i) => (
            <div key={i} className="rounded-2xl border border-rule overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-paper-2 transition-colors"
              >
                <span className="font-semibold text-ink pr-4">{item.q}</span>
                <span className={`shrink-0 text-accent transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 pb-5 px-5' : 'max-h-0'}`}>
                <p className="text-sm text-ink-2 leading-relaxed">
                  {item.a.replace('+90 539 775 1517', contactContent.whatsapp_phone || '+90 539 775 1517')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════ HIZLI BİLGİ ═══════════ */}
    <section className="section bg-paper-2">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Hızlı Bilgi</p>
          <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-bold text-ink">Özet Bilgiler</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { i: '⏱️', t: 'İşlem Süresi', v: '5-10 kg/saat', d: 'Parti büyüklüğüne göre' },
            { i: '📦', t: 'Paketleme', v: 'Vakumlu', d: '24 ay tazelik garantisi' },
            { i: '📍', t: 'Hizmet Bölgesi', v: 'Hendek + Sakarya', d: 'Aynı gün teslimat' },
            { i: '📅', t: 'Çalışma Günleri', v: 'Pzt-Cmt', d: '08:00 - 18:00' },
          ].map((c) => (
            <div key={c.t} className="text-center p-8 rounded-2xl bg-surface border border-rule hover:border-accent transition-colors">
              <div className="text-3xl mb-2">{c.i}</div>
              <p className="text-xs font-semibold tracking-widest uppercase text-ink-3 mb-1">{c.t}</p>
              <p className="text-xl font-bold text-accent mb-1 font-[family-name:var(--font-display)]">{c.v}</p>
              <p className="text-sm text-ink-2">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════ GALERİ ═══════════ */}
    <section className="section bg-surface">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">Galeri</p>
          <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">İşleme Hattımızdan Kareler</h2>
          <p className="text-ink-2 max-w-xl mx-auto">Profesyonel ekipmanlarımız ve işleme sürecimizden görüntüler.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {galleryImages.map((img, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden border border-rule aspect-[4/3] bg-paper-2">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">
                    {i === 0 ? '⚙️' : i === 1 ? '📐' : i === 2 ? '📦' : '✨'}
                  </div>
                  <p className="text-sm font-semibold text-ink">{img.label}</p>
                  <p className="text-xs text-ink-3 mt-1">Görsel yakında</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-semibold bg-accent/80 px-3 py-1 rounded-full">{img.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════ SSS (SEO) ═══════════ */}
    <section className="section bg-paper">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-ink mb-4">❓ Sık Sorulan Sorular</h2>
          <p className="text-ink-2 max-w-xl mx-auto">Fındık işleme hizmetimiz hakkında en çok merak edilenler.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {seoFaqItems.map((item, i) => (
            <div key={i} className="rounded-xl border border-rule bg-paper-2 overflow-hidden">
              <button
                onClick={() => setOpenSeoFaq(openSeoFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-paper/50 transition-colors"
              >
                <span className="font-semibold text-ink pr-4">{item.q}</span>
                <span className={`shrink-0 text-accent transition-transform duration-300 ${openSeoFaq === i ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSeoFaq === i ? 'max-h-96 pb-5 px-5' : 'max-h-0'}`}>
                <p className="text-sm text-ink-2 leading-relaxed">
                  {item.a.replace('+90 539 775 1517', contactContent.whatsapp_phone || '+90 539 775 1517')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════ CTA ═══════════ */}
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f1f10 0%, #1a2f1a 100%)' }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #1a6532 0%, transparent 50%)' }}></div>
      <div className="container relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-[family-name:var(--font-display)] font-bold text-white mb-4">
          Fındıklarınızı<br />Bize Emanet Edin
        </h2>
        <p className="text-lg text-white/60 max-w-lg mx-auto mb-10">
          Evleriniz için ayırdığınız fındıklar artık çürümeyecek, tadı bozulmayacak. Profesyonel ekipman ve hijyenik ortamda, maksimum randımanla işliyoruz.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={`https://wa.me/${wp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-primary btn-lg" style={{ background: '#1a6532', color: '#fff' }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
            WhatsApp'tan Bilgi Al
          </a>
          <Link to="/iletisim" className="btn btn-outline btn-lg border-white/20 text-white hover:bg-white/10">📧 İletişim</Link>
        </div>
        <p className="text-white/40 text-sm mt-8">
          Veya doğrudan arayın: <a href={`tel:${contactContent.phone}`} className="text-white/80 hover:text-white underline">{contactContent.phone}</a>
        </p>
        <p className="text-white/30 text-xs mt-4">
          Fındık kırma hizmetimiz hakkında daha fazla bilgi için: <a href="https://hendekfindikkirma.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white underline">hendekfindikkirma.com</a>
        </p>
      </div>
    </section>
  </>);
};

export default FindikIslemePage;
