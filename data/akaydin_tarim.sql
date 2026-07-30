/*
 Navicat Premium Dump SQL

 Source Server         : BUGGY
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : akaydin_tarim

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 12/07/2026 04:07:54
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for about_page
-- ----------------------------
DROP TABLE IF EXISTS `about_page`;
CREATE TABLE `about_page`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `mission` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vision` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of about_page
-- ----------------------------
INSERT INTO `about_page` VALUES (2, 'Çiftçilerimize en yenilikçi tarım teknolojilerini ve en kaliteli ürünleri sunarak, onların verimliliğini ve gelirini artırmak. Sürdürülebilir tarım uygulamalarını yaygınlaştırarak hem toprağımızı korumak hem de gelecek nesillere daha verimli araziler bırakmak en temel amacımızdır.', 'Türkiye\'nin fındık ve tarım sektöründe, teknoloji kullanımı, danışmanlık hizmetleri ve ürün kalitesiyle referans gösterilen lider bir marka olmak. Tarımda dijital dönüşüme öncülük ederek, sektörü geleceğe taşımak.', '2025-10-31 19:02:49', '2025-10-31 20:31:16', '', 'AKAYDIN TARIM, 2023 yılında, ömrünü fındık üretimine adamış olan Aydın Ak tarafından kurulmuştur. Kurucumuz Aydın Ak, yılların getirdiği deneyimi ve geleneksel üretim bilgisini, modern tarım teknolojileriyle birleştirerek sektöre yenilikçi bir soluk kazandırmayı hedeflemiştir.\n\nKuruluşundan bu yana “Doğadan Aldığımızı, Doğaya Geri Veriyoruz” ilkesiyle hareket eden AKAYDIN TARIM; üretimde kaliteyi, sürdürülebilirliği ve çevre bilincini merkezine almıştır. Her adımda doğaya saygılı, toprağa dost uygulamalarla ilerleyen firmamız, organomineral gübre, fındık bahçesi danışmanlığı ve tarımsal ürün tedariki alanlarında bölgesel kalkınmaya katkı sağlamaktadır.\n\n2024 yılında Ferrero firması tarafından düzenlenen Budama Yarışması’nda “Altın Makas Ödülü” kazanan Aydın Ak, başarısıyla yalnızca üretimde değil, bilgi ve deneyim paylaşımında da öncü olmuştur. AKAYDIN TARIM bugün, fındık üretiminde verimliliği artıran modern teknikleri bölge çiftçilerine tanıtarak, Sakarya ve çevresinde sürdürülebilir tarımın gelişimine öncülük etmektedir.\n\nToprağın gücüne inanıyoruz. Çünkü biliyoruz ki, sağlıklı toprak güçlü bir geleceğin temelidir.\nBu inançla, her geçen gün daha verimli, daha bilinçli ve daha doğa dostu bir tarım anlayışı için çalışıyoruz.\n\n🌱 AKAYDIN TARIM — Toprağınızın Gücünü Keşfedin. 🌿', '[\"\\/akaydin-tarim\\/uploads\\/about\\/1761931773_2a3ca3045b0c9825.jpg\",\"\\/akaydin-tarim\\/uploads\\/about\\/1761931773_c48b4d7fa60d86bc.jpg\",\"\\/akaydin-tarim\\/uploads\\/about\\/1761931773_56f002634a2c870a.jpg\",\"\\/akaydin-tarim\\/uploads\\/about\\/1761931774_e84a046df47b2699.jpg\"]');

-- ----------------------------
-- Table structure for active_visitors
-- ----------------------------
DROP TABLE IF EXISTS `active_visitors`;
CREATE TABLE `active_visitors`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `visitor_fingerprint` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `device_type` enum('desktop','mobile','tablet') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'desktop',
  `browser` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `operating_system` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_new_visitor` tinyint(1) NULL DEFAULT 1,
  `is_return_visitor` tinyint(1) NULL DEFAULT 0,
  `first_visit_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_activity_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `current_page` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '/',
  `current_page_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `previous_page` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `entry_page` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `session_start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `session_duration` int NULL DEFAULT 0,
  `total_page_views` int NULL DEFAULT 1,
  `total_time_on_site` int NULL DEFAULT 0,
  `referrer` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `utm_source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `utm_medium` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `utm_campaign` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `heartbeat_count` int NULL DEFAULT 0,
  `last_heartbeat` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_visitor_fingerprint`(`visitor_fingerprint` ASC) USING BTREE,
  INDEX `idx_last_activity`(`last_activity_time` ASC) USING BTREE,
  INDEX `idx_is_active`(`is_active` ASC) USING BTREE,
  INDEX `idx_session_start`(`session_start_time` ASC) USING BTREE,
  INDEX `idx_heartbeat`(`last_heartbeat` ASC) USING BTREE,
  INDEX `idx_country_city`(`country` ASC, `city` ASC) USING BTREE,
  INDEX `idx_active_visitors_last_activity`(`last_activity_time` ASC, `is_active` ASC) USING BTREE,
  INDEX `idx_active_visitors_fingerprint_active`(`visitor_fingerprint` ASC, `is_active` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 56 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of active_visitors
-- ----------------------------

-- ----------------------------
-- Table structure for ai_providers
-- ----------------------------
DROP TABLE IF EXISTS `ai_providers`;
CREATE TABLE `ai_providers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `api_key` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_verified` tinyint(1) NULL DEFAULT NULL,
  `available_models` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ai_providers
-- ----------------------------

-- ----------------------------
-- Table structure for ai_settings
-- ----------------------------
DROP TABLE IF EXISTS `ai_settings`;
CREATE TABLE `ai_settings`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `selected_provider_id` int NULL DEFAULT NULL,
  `selected_model` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `temperature` decimal(3, 2) NULL DEFAULT NULL,
  `max_tokens` int NULL DEFAULT NULL,
  `auto_generation_enabled` tinyint(1) NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ai_settings
-- ----------------------------

-- ----------------------------
-- Table structure for analytics_settings
-- ----------------------------
DROP TABLE IF EXISTS `analytics_settings`;
CREATE TABLE `analytics_settings`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `analytics_enabled` tinyint(1) NULL DEFAULT 1,
  `track_ip_addresses` tinyint(1) NULL DEFAULT 1,
  `data_retention_days` int NULL DEFAULT 365,
  `exclude_ips` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `exclude_user_agents` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `privacy_mode` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of analytics_settings
-- ----------------------------

-- ----------------------------
-- Table structure for blog_posts
-- ----------------------------
DROP TABLE IF EXISTS `blog_posts`;
CREATE TABLE `blog_posts`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `author` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `views` int NULL DEFAULT 0,
  `excerpt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `seo_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `seo_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `seo_keywords` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of blog_posts
-- ----------------------------
INSERT INTO `blog_posts` VALUES (12, 'Fındığın Sağlık Faydaları: Her Gün Bir Avuç Fındık', '', '\nFındık, binlerce yıldır insan beslenmesinde önemli bir yer tutan, besleyici ve lezzetli bir kuru meyve türüdür. Günlük diyetinize fındık eklemenin sayısız faydası vardır.\n\nFındığın başlıca sağlık faydaları:\n\n🫀 Kalp Sağlığı\nFındıkta bulunan tekli doymamış yağlar, kötü kolesterolü düşürmeye yardımcı olur.\n\n🧠 Beyin Gücü\nE vitamini ve omega-3 yağ asitleri beyin fonksiyonlarını destekler.\n\n💪 Enerji Kaynağı\nProtein ve sağlıklı yağlar sayesinde uzun süreli enerji sağlar.\n\n🛡️ Antioksidan Deposu\nC vitamini ve E vitamini ile bağışıklık sistemini güçlendirir.\n\nGünde 30 gram (yaklaşık 20-25 adet) fındık tüketimi önerilmektedir. Akaydın Tarım\'ın taze ve kaliteli fındıkları ile sağlıklı yaşamınıza katkıda bulunabilirsiniz.', 'Erkan ERDEM', '2025-10-31', '/akaydin-tarim/uploads/blog/1761921867_d9ff2bef17513d70.jpg', '2025-10-31 17:44:12', '2025-10-31 17:44:58', 1, 'Fındık, protein, lif ve sağlıklı yağlar açısından zengin bir besin kaynağıdır', NULL, NULL, NULL);
INSERT INTO `blog_posts` VALUES (13, '🌿 Toprağa Saygı, Geleceğe Yatırım: Organomineral Gübre ile Verimli Bir Yolculuk', '', 'Ben Aydın Ak.\nYıllardır fındık üretimiyle iç içe bir yaşam sürdürüyorum. Çocukluğumdan bu yana toprağın kokusunu, mevsimlerin değişimini ve her fındık dalının bize ne anlattığını öğrenerek büyüdüm. Bu topraklar, bana hem ekmeğimi hem de emeğin kıymetini öğretti.\n\nZamanla gördüm ki, verimli bir tarımın sırrı yalnızca iyi tohumda ya da güçlü bir bitkide değil; sağlıklı toprakta yatıyor.\nToprak yorgunsa, su dengesini kaybetmişse, organik yapısı zayıflamışsa… hangi tohumu atarsanız atın, istediğiniz sonucu alamazsınız. İşte bu noktada organomineral gübre devreye giriyor.\n\nOrganomineral gübre, hem organik hem de mineral içeriğiyle toprağa çift yönlü bir destek sağlıyor.\nOrganik kısmı toprağın canlılığını yeniden kazandırıyor; mineral kısmı ise bitkinin hemen alabileceği besinleri veriyor. Yani hem kısa vadede etki sağlıyor, hem de uzun vadede toprağın doğal yapısını koruyor.\n\nBenim için bu ürünlerin en önemli yanı, doğaya zarar vermeden verimi artırmak.\nEskiden kimyasal gübrelerle sadece bir sezonluk verim hedeflenirdi. Fakat biz biliyoruz ki, toprak sadece bugünün değil, yarının da rızkını taşır.\nO yüzden organomineral gübre kullanmak, toprağa yapılan bir yatırım demektir.\n\nAKAYDIN TARIM olarak yıllardır yaptığımız saha çalışmalarında, bu gübrelerin nasıl fark yarattığını birebir gözlemledim.\nToprak daha kolay işleniyor, bitkiler daha güçlü büyüyor ve fındığın kalitesi gözle görülür şekilde artıyor. En güzeli de, çiftçimiz artık hasat sonrası toprağını değil, geleceğini koruduğunu biliyor.\n\nBizim vizyonumuz basit ama anlamlı:\nDoğaya dost, insana faydalı bir üretim modeli.\nBu yüzden her üreticiye gönül rahatlığıyla diyorum ki:\n👉 Toprağınıza yatırım yapın.\n👉 Organomineral gübreyle toprağınızın gücünü yeniden keşfedin.\n👉 Çünkü verimli toprak, sürdürülebilir geleceğin ta kendisidir.\n\nToprağınız bereketli, ürününüz daim olsun.\n\n🌱\nAydın Ak\nKurucu – AKAYDIN TARIM', 'Aydın AK', '2025-10-31', '/akaydin-tarim/uploads/blog/1761929108_a5dc5cb104a9ccfb.jpg', '2025-10-31 19:45:08', '2025-10-31 19:45:31', 1, 'Zamanla gördüm ki, verimli bir tarımın sırrı yalnızca iyi tohumda ya da güçlü bir bitkide değil; sağlıklı toprakta yatıyor.', NULL, NULL, NULL);
INSERT INTO `blog_posts` VALUES (14, '✂️ Fındık Üretiminde Budamanın Önemi', '', 'Ben Aydın Ak.\nYıllarımı fındık üretimine verdim, bu süreçte toprağın, ağacın ve emeğin dilini öğrenmeye çalıştım. Şunu açık yüreklilikle söyleyebilirim:\nBir fındık bahçesinin verimi, budama bilgisiyle doğru orantılıdır.\n\nNe kadar iyi gübreleme yaparsanız yapın, ne kadar kaliteli fidan dikerseniz dikin — eğer doğru budama yapılmıyorsa, verim zamanla düşer, dal yenilenmez ve bahçe yaşlanmaya başlar.\nİşte bu yüzden budama, fındık üretiminin kalbidir.\n\n🌱 Budama Neden Bu Kadar Önemli?\n\nAğacı Genç Tutmak İçindir.\nFındık dalları yaşlandıkça meyve verimi azalır. Düzenli budama, ağacın genç sürgünler vermesini sağlar. Bu da verimi sürekli kılar.\n\nHastalıklara Karşı Korur.\nBudama, hava sirkülasyonunu artırır. Işığı daha iyi alan dallar daha sağlıklı olur, mantar ve zararlı hastalıkların önüne geçilir.\n\nVerimi ve Kaliteyi Artırır.\nEnerji, gereksiz dallarda harcanmak yerine meyve veren dallara yönelir. Böylece hem fındığın iriliği artar hem de yağ oranı dengelenir.\n\nToprakla Uyum Sağlar.\nHer toprak ve iklim farklıdır. Doğru budama yöntemi, toprağın yapısına göre seçilmelidir. Biz AKAYDIN TARIM olarak üreticilerimize bu konuda saha desteği sunuyoruz.\n\n🏆 “Altın Makas” Ödülümüzün Gururu\n\n2024 yılında, Ferrero firması tarafından düzenlenen Budama Yarışması’nda Altın Makas Ödülü’nü almak bizim için büyük bir onur oldu.\nAma bu ödül, sadece bir başarı değil; doğru budamanın, bilgiyle ve sabırla yapıldığında ne kadar fark yaratabileceğinin de bir göstergesidir.\n\n🌿 AKAYDIN TARIM’DA BUDAMA BİR KÜLTÜRDÜR\n\nBizim için budama, sadece bir tarım uygulaması değil, toprağa saygının bir ifadesidir.\nHer üreticiye söylediğim gibi:\n“Budama, ağacı cezalandırmak değil; ona nefes aldırmaktır.”\n\nDoğru zamanda, doğru yöntemle yapılan her budama, bir sonraki sezonun bereketini hazırlar.\nVe biz AKAYDIN TARIM olarak, bu bilinci her geçen gün daha fazla üreticiyle paylaşmanın gururunu yaşıyoruz.\n\n✂️ Unutmayın:\nVerimli bir fındık bahçesi, doğru budamayla başlar.', 'Aydın Ak', '2025-10-31', '/akaydin-tarim/uploads/blog/1761930738_5375e3ed99180b08.jpg', '2025-10-31 20:12:18', '2025-10-31 20:12:18', 0, 'Bir fındık bahçesinin verimi, budama bilgisiyle doğru orantılıdır.', NULL, NULL, NULL);
INSERT INTO `blog_posts` VALUES (15, 'Fındık İşleme Nedir? Detaylı Rehber', '', '<h2>???? Fındık İşleme Nedir?</h2>\n    <p>Fındık işleme, fındığın daldan toplanmasından sonra tüketime hazır hale getirilmesi için yapılan tüm işlemleri kapsar. Bu süreç, fındığın kalitesini, raf ömrünü ve lezzetini doğrudan etkiler.</p>\n    \n    <h3>???? Fındık İşleme Aşamaları</h3>\n    \n    <h4>1️⃣ Hasat ve Toplama</h4>\n    <p>Fındık hasadı genellikle <strong>Ağustos-Eylül</strong> aylarında yapılır. Fındıklar yerden toplanır ve çuval ya da naylon çuvallarda taşınır.</p>\n    <ul>\n        <li><strong>Doğru Zaman:</strong> Fındık kabukları kahverengileştiğinde</li>\n        <li><strong>Yöntem:</strong> Manuel veya makine ile toplama</li>\n        <li><strong>Depolama:</strong> Havadar ve kuru ortamda</li>\n    </ul>\n    \n    <h4>2️⃣ Temizleme</h4>\n    <p>Toplanan fındıklar yaprak, dal, toprak gibi yabancı maddelerden arındırılır.</p>\n    <ul>\n        <li>Fındık temizleme makinesi kullanılır</li>\n        <li>Hava akımı ile hafif maddeler ayrılır</li>\n        <li>Elek sistemleriyle boyutlandırma yapılır</li>\n    </ul>\n    \n    <h4>3️⃣ Kurutma</h4>\n    <p>Fındıkların nem oranı <strong>%6-8</strong> seviyesine indirilir. Aksi halde küflenme riski yüksektir.</p>\n    <ul>\n        <li><strong>Güneşte Kurutma:</strong> Geleneksel yöntem (7-10 gün)</li>\n        <li><strong>Fırında Kurutma:</strong> Hızlı ve kontrollü (2-3 gün)</li>\n        <li><strong>Modern Kurutucular:</strong> Endüstriyel tesislerde kullanılır</li>\n    </ul>\n    \n    <h4>4️⃣ Fındık Kırma</h4>\n    <p>Fındığın sert kabuktan ayrılması işlemidir. <strong>Profesyonel fındık kırma makineleri</strong> kullanılarak hasarsız şekilde yapılır.</p>\n    <blockquote>\n        ???? <strong>Önemli Not:</strong> Manuel kırma yönteminde hasar oranı %15-20 olabilirken, makineli kırmada bu oran %1\'in altındadır!\n    </blockquote>\n    \n    <h4>5️⃣ Kabuk Ayrımı</h4>\n    <p>Kırılan fındıklardan kabuklar tamamen ayrılır. Hava akımı veya elek sistemleri kullanılır.</p>\n    \n    <h4>6️⃣ İç Zar Soyma (Opsiyonel)</h4>\n    <p>Bazı kullanım alanları için fındığın iç zarının (kahverengi ince tabaka) soyulması gerekir.</p>\n    <ul>\n        <li>Kavurma işlemi sonrası kolaylaşır</li>\n        <li>Manuel veya makine ile yapılır</li>\n        <li>Çikolata ve pasta endüstrisi için gereklidir</li>\n    </ul>\n    \n    <h4>7️⃣ Kavurma (Opsiyonel)</h4>\n    <p>Fındıkların aromasını geliştirmek ve raf ömrünü uzatmak için <strong>150-180°C</strong> sıcaklıkta kavrulur.</p>\n    <ul>\n        <li><strong>Hafif Kavurma:</strong> 10-12 dakika (açık renk)</li>\n        <li><strong>Orta Kavurma:</strong> 15-18 dakika (altın sarısı)</li>\n        <li><strong>Koyu Kavurma:</strong> 20-25 dakika (kahverengi)</li>\n    </ul>\n    \n    <h4>8️⃣ Sınıflandırma</h4>\n    <p>Fındıklar kalite ve boyutlarına göre sınıflandırılır:</p>\n    <ul>\n        <li><strong>Giresun Kalite (13-15 mm):</strong> En kaliteli</li>\n        <li><strong>Levant Kalite (11-13 mm):</strong> Orta kalite</li>\n        <li><strong>Küçük Boy (9-11 mm):</strong> Ezme ve pasta için</li>\n    </ul>\n    \n    <h4>9️⃣ Paketleme</h4>\n    <p>Fındıklar tüketime hazır hale getirilerek paketlenir:</p>\n    <ul>\n        <li><strong>Naylon Torba:</strong> Evsel kullanım (raf ömrü 6 ay)</li>\n        <li><strong>Vakumlu Paket:</strong> Uzun süre saklama (raf ömrü 2 yıl)</li>\n        <li><strong>Kavanoz:</strong> Perakende satış için</li>\n    </ul>\n    \n    <h3>⚠️ Fındık İşlemede Dikkat Edilmesi Gerekenler</h3>\n    \n    <div style=\"background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;\">\n        <strong>1. Nem Kontrolü:</strong> Fındık nem oranı %8\'in üzerinde olmamalı. Aksi halde küflenme ve aflatoksin riski vardır.\n    </div>\n    \n    <div style=\"background: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;\">\n        <strong>2. Hijyen:</strong> Tüm işlem aşamalarında hijyenik koşullar sağlanmalı. Makine ve ekipmanlar düzenli temizlenmelidir.\n    </div>\n    \n    <div style=\"background: #dcfce7; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0;\">\n        <strong>3. Doğru Depolama:</strong> Fındıklar serin (15-20°C), kuru (%50-60 nem) ve karanlık ortamda saklanmalıdır.\n    </div>\n    \n    <div style=\"background: #fce7f3; padding: 15px; border-left: 4px solid #ec4899; margin: 20px 0;\">\n        <strong>4. Kalite Kontrol:</strong> Her aşamada çürük, hasarlı ve boş fındıklar ayıklanmalıdır.\n    </div>\n    \n    <h3>???? Profesyonel Fındık İşleme Tesisi mi, Yoksa Evde mi?</h3>\n    \n    <table border=\"1\" cellpadding=\"10\" style=\"width:100%; border-collapse: collapse; margin: 20px 0;\">\n        <tr style=\"background: #f3f4f6;\">\n            <th>Özellik</th>\n            <th>Evde İşleme</th>\n            <th>Profesyonel Tesis</th>\n        </tr>\n        <tr>\n            <td><strong>Kapasite</strong></td>\n            <td>5-10 kg/gün</td>\n            <td>200-500 kg/saat</td>\n        </tr>\n        <tr>\n            <td><strong>Hasar Oranı</strong></td>\n            <td>%15-20</td>\n            <td>%1\'in altı</td>\n        </tr>\n        <tr>\n            <td><strong>Temizlik</strong></td>\n            <td>%80-85</td>\n            <td>%99,5</td>\n        </tr>\n        <tr>\n            <td><strong>İşçilik</strong></td>\n            <td>Yoğun</td>\n            <td>Otomatik</td>\n        </tr>\n        <tr>\n            <td><strong>Hijyen</strong></td>\n            <td>Orta</td>\n            <td>Yüksek</td>\n        </tr>\n        <tr>\n            <td><strong>Maliyet</strong></td>\n            <td>Düşük (zaman kaybı yüksek)</td>\n            <td>Makul (toplu işlem)</td>\n        </tr>\n    </table>\n    \n    <h3>???? Hendek\'te Fındık İşleme</h3>\n    <p><strong>Sakarya Hendek</strong> bölgesi, Karadeniz\'e yakınlığı ve uygun iklim koşulları sayesinde önemli bir fındık üretim bölgesidir.</p>\n    <ul>\n        <li>Yıllık 5000+ ton fındık üretimi</li>\n        <li>Modern fındık işleme tesisleri</li>\n        <li>Ankara, İstanbul ve Düzce\'ye yakınlık avantajı</li>\n        <li>Profesyonel fındık kırma ve kavurma hizmetleri</li>\n    </ul>\n    \n    <blockquote style=\"background: #f0fdf4; padding: 20px; border-left: 5px solid #22c55e; margin: 20px 0;\">\n        ???? <strong>Akaydın Tarım Farkı:</strong> Hendek\'te ilk ve tek profesyonel fındık işleme tesisi! \n        7 aşamalı hijyenik işlem, son teknoloji makineler, vakumlu paketleme seçeneği. \n        <a href=\"/#/hendek-findik-kirma\">Fındıklarınızı bize emanet edin!</a>\n    </blockquote>\n    \n    <h3>???? İlgili Konular</h3>\n    <ul>\n        <li><a href=\"/#/blog\">Fındık Kırma Makineleri Nasıl Çalışır?</a></li>\n        <li><a href=\"/#/blog\">Hendek Bölgesinde Fındık İşleme Avantajları</a></li>\n        <li><a href=\"/#/hizmetlerimiz\">Profesyonel Fındık Kırma Hizmeti</a></li>\n    </ul>', 'Aydın Ak', '2025-01-15', '', '2025-10-31 23:45:38', '2025-10-31 23:45:38', 0, 'Fındık işleme süreci nedir, nasıl yapılır? Hasat, kurutma, kırma, kavurma ve paketleme aşamalarıyla detaylı fındık işleme rehberi. Hendek\'te profesyonel fındık işleme hizmetleri.', NULL, NULL, NULL);
INSERT INTO `blog_posts` VALUES (16, 'Fındık Kırma Makineleri Nasıl Çalışır? Teknik Rehber', '', '<h2>⚙️ Fındık Kırma Makineleri Nasıl Çalışır?</h2>\n    <p>Fındık kırma makineleri, fındığın sert kabuktan hasarsız şekilde ayrılmasını sağlayan özel tasarlanmış endüstriyel ekipmanlardır. Modern fındık kırma teknolojisi, geleneksel yöntemlere göre <strong>%95 daha verimli</strong> ve <strong>%90 daha hızlı</strong> çalışır.</p>\n    \n    <h3>???? Fındık Kırma Makinesinin Temel Bileşenleri</h3>\n    \n    <h4>1. Besleme Hunisi</h4>\n    <ul>\n        <li>Fındıkların makineye girdiği bölüm</li>\n        <li>Ayarlanabilir akış kontrolü</li>\n        <li>Genellikle 50-100 kg kapasite</li>\n    </ul>\n    \n    <h4>2. Kırma Tamburu (Ana Mekanizma)</h4>\n    <p>Makinenin kalbi! İçinde özel tasarlanmış kırma parmakları vardır:</p>\n    <ul>\n        <li><strong>Malzeme:</strong> Sertleştirilmiş çelik veya krom-nikel alaşımı</li>\n        <li><strong>Dönüş Hızı:</strong> 300-600 devir/dakika</li>\n        <li><strong>Ayar:</strong> Fındık boyutuna göre mesafe ayarlanabilir</li>\n    </ul>\n    \n    <h4>3. Elek Sistemi</h4>\n    <ul>\n        <li>Kırılan fındıkları boyutlandırır</li>\n        <li>3-4 farklı göz açıklığında elek</li>\n        <li>Titreşim hareketi ile ayrıştırma</li>\n    </ul>\n    \n    <h4>4. Hava Akımı Ünitesi</h4>\n    <ul>\n        <li>Kabukları fındık içinden ayırır</li>\n        <li>Güçlü fan sistemi (1-2 HP)</li>\n        <li>Toz emme filtresi</li>\n    </ul>\n    \n    <h4>5. Toplama Bölmesi</h4>\n    <ul>\n        <li>Temiz fındıkların toplandığı alan</li>\n        <li>Kabuklar ayrı bölmede toplanır</li>\n    </ul>\n    \n    <h3>⚡ Fındık Kırma Makinesi Çalışma Prensibi</h3>\n    \n    <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin: 20px 0;\">\n        <h4 style=\"color: #fbbf24; margin-top: 0;\">Adım 1: Fındıklar Besleme Hunisine Atılır</h4>\n        <p>Operatör, temizlenmiş ve kurutulmuş fındıkları huniye döker. Burada fındıklar sırayla tambura yönlendirilir.</p>\n        \n        <h4 style=\"color: #fbbf24;\">Adım 2: Tambur Dönerken Fındıkları Kırar</h4>\n        <p>Hızla dönen kırma parmakları, fındıkları belirli basınçla sıkıştırır. Kabuk çatlar ama fındık iç kısmı zarar görmez.</p>\n        \n        <h4 style=\"color: #fbbf24;\">Adım 3: Elek Sistemi Devreye Girer</h4>\n        <p>Kırılan karışım (fındık + kabuk) eleklere gelir. Titreşim hareketi ile büyük ve küçük parçalar ayrılır.</p>\n        \n        <h4 style=\"color: #fbbf24;\">Adım 4: Hava Akımı Kabukları Ayırır</h4>\n        <p>Güçlü hava akımı, hafif olan kabuk parçalarını emip ayrı bir bölmeye taşır. Ağır fındıklar aşağıya düşer.</p>\n        \n        <h4 style=\"color: #fbbf24;\">Adım 5: Temiz Fındıklar Toplanır</h4>\n        <p>Kabuklarından tamamen ayrılmış, temiz fındıklar toplama kasasına düşer. Makine otomatik çalışır.</p>\n    </div>\n    \n    <h3>???? Fındık Kırma Makinesi Türleri</h3>\n    \n    <h4>1️⃣ Manuel Fındık Kırma Makinesi</h4>\n    <ul>\n        <li><strong>Kapasite:</strong> 30-50 kg/saat</li>\n        <li><strong>Güç:</strong> Kol gücü ile çalışır</li>\n        <li><strong>Fiyat:</strong> 3.000-5.000 TL</li>\n        <li><strong>Kullanım:</strong> Ev kullanımı ve küçük üreticiler</li>\n        <li>✅ <strong>Avantajlar:</strong> Ucuz, elektrik gerektirmez</li>\n        <li>❌ <strong>Dezavantajlar:</strong> Yorucu, düşük kapasite</li>\n    </ul>\n    \n    <h4>2️⃣ Elektrikli Masaüstü Fındık Kırma Makinesi</h4>\n    <ul>\n        <li><strong>Kapasite:</strong> 80-120 kg/saat</li>\n        <li><strong>Güç:</strong> 1-2 HP elektrik motoru</li>\n        <li><strong>Fiyat:</strong> 15.000-25.000 TL</li>\n        <li><strong>Kullanım:</strong> Orta ölçekli işletmeler</li>\n        <li>✅ <strong>Avantajlar:</strong> Hızlı, az yer kaplar</li>\n        <li>❌ <strong>Dezavantajlar:</strong> Sınırlı kapasite</li>\n    </ul>\n    \n    <h4>3️⃣ Endüstriyel Fındık Kırma Makinesi</h4>\n    <ul>\n        <li><strong>Kapasite:</strong> 200-500 kg/saat</li>\n        <li><strong>Güç:</strong> 5-7,5 HP trifaze motor</li>\n        <li><strong>Fiyat:</strong> 80.000-150.000 TL</li>\n        <li><strong>Kullanım:</strong> Profesyonel tesisler</li>\n        <li>✅ <strong>Avantajlar:</strong> Çok yüksek kapasite, tam otomatik</li>\n        <li>❌ <strong>Dezavantajlar:</strong> Pahalı, geniş alan gerektirir</li>\n    </ul>\n    \n    <h4>4️⃣ Kombine Fındık İşleme Hattı</h4>\n    <ul>\n        <li><strong>Kapasite:</strong> 1-5 ton/saat</li>\n        <li><strong>Bileşenler:</strong> Temizleme + Kırma + Kabuk Ayırma + Sınıflandırma</li>\n        <li><strong>Fiyat:</strong> 500.000+ TL</li>\n        <li><strong>Kullanım:</strong> Büyük fındık fabrikaları</li>\n    </ul>\n    \n    <h3>???? Fındık Kırma Makinesinde Kullanılan Teknolojiler</h3>\n    \n    <h4>⚙️ Ayarlanabilir Kırma Aralığı</h4>\n    <p>Fındık boyutuna göre kırma parmakları arasındaki mesafe ayarlanır:</p>\n    <ul>\n        <li><strong>Büyük Fındık (14-16 mm):</strong> 3-4 mm aralık</li>\n        <li><strong>Orta Fındık (11-13 mm):</strong> 2-3 mm aralık</li>\n        <li><strong>Küçük Fındık (9-11 mm):</strong> 1,5-2 mm aralık</li>\n    </ul>\n    \n    <h4>????️ Aspiration (Hava Emme) Sistemi</h4>\n    <p>Kabuk ayrımında kritik rol oynar:</p>\n    <ul>\n        <li>Hava hızı: 15-25 m/saniye</li>\n        <li>Filtreli emme: Toz kontrol</li>\n        <li>%99,5 kabuk ayrımı sağlar</li>\n    </ul>\n    \n    <h4>???? Otomatik Kontrol Sistemi (Modern Makinelerde)</h4>\n    <ul>\n        <li>PLC kontrol paneli</li>\n        <li>Dijital hız ayarı</li>\n        <li>Sensörlerle tıkanma koruması</li>\n        <li>Otomatik durdurma</li>\n    </ul>\n    \n    <h3>⚠️ Fındık Kırma Makinesinde Hasar Sebepleri</h3>\n    \n    <table border=\"1\" cellpadding=\"10\" style=\"width:100%; border-collapse: collapse; margin: 20px 0;\">\n        <tr style=\"background: #fee2e2;\">\n            <th>Hasar Tipi</th>\n            <th>Sebep</th>\n            <th>Çözüm</th>\n        </tr>\n        <tr>\n            <td><strong>Kırık Fındık</strong></td>\n            <td>Aşırı basınç</td>\n            <td>Kırma aralığını genişlet</td>\n        </tr>\n        <tr>\n            <td><strong>Yarım Kırılma</strong></td>\n            <td>Yetersiz basınç</td>\n            <td>Aralığı daralt veya hızı artır</td>\n        </tr>\n        <tr>\n            <td><strong>Ezik Fındık</strong></td>\n            <td>Çok hızlı dönüş</td>\n            <td>Motor hızını düşür</td>\n        </tr>\n        <tr>\n            <td><strong>Kalan Kabuk</strong></td>\n            <td>Zayıf hava akımı</td>\n            <td>Fanı temizle, gücü artır</td>\n        </tr>\n    </table>\n    \n    <h3>???? Fındık Kırma Makinesi Bakımı</h3>\n    \n    <div style=\"background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0;\">\n        <h4>Günlük Bakım</h4>\n        <ul>\n            <li>✓ Kırma tamburu temizliği</li>\n            <li>✓ Elek gözeneklerini kontrol</li>\n            <li>✓ Kabuk toplama kasasını boşalt</li>\n            <li>✓ Hava filtresini temizle</li>\n        </ul>\n    </div>\n    \n    <div style=\"background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;\">\n        <h4>Haftalık Bakım</h4>\n        <ul>\n            <li>✓ Yağlama noktalarını gözden geçir</li>\n            <li>✓ Kayış gerginliğini kontrol et</li>\n            <li>✓ Rulman seslerini dinle</li>\n            <li>✓ Elektrik bağlantılarını sıkılaştır</li>\n        </ul>\n    </div>\n    \n    <h3>???? Fındık Kırma Makinesinden Maksimum Verim Almak İçin İpuçları</h3>\n    \n    <ol>\n        <li><strong>Fındıkları Kuru Kır:</strong> Nem oranı %6-8 olan fındıklar en iyi sonucu verir.</li>\n        <li><strong>Boyutlandırma Yap:</strong> Aynı boyuttaki fındıkları birlikte kır, verim artar.</li>\n        <li><strong>Çürük Ayıkla:</strong> Çürük fındıklar makineye zarar verir, önceden ayıkla.</li>\n        <li><strong>Düzenli Temizlik:</strong> Her 100 kg\'da bir makineyi temizle.</li>\n        <li><strong>Doğru Ayar:</strong> İlk 1-2 kg ile test yap, gerekirse ayar değiştir.</li>\n    </ol>\n    \n    <h3>???? Hendek\'te Fındık Kırma Makinesi Hizmeti</h3>\n    \n    <blockquote style=\"background: #f0fdf4; padding: 20px; border-left: 5px solid #22c55e;\">\n        <strong>Akaydın Tarım</strong> olarak, Hendek\'te <strong>200 kg/saat kapasiteli</strong> son teknoloji fındık kırma makinemizle hizmet veriyoruz. \n        <br><br>\n        ✅ %99,5 temizlik garantisi<br>\n        ✅ %1\'in altında hasar oranı<br>\n        ✅ Hijyenik paslanmaz çelik makine<br>\n        ✅ 24 saat içinde teslimat<br>\n        <br>\n        ???? <a href=\"/#/hendek-findik-kirma\">Fındık Kırma Hizmetimiz Hakkında Detaylı Bilgi</a>\n    </blockquote>\n    \n    <h3>???? İlgili Makaleler</h3>\n    <ul>\n        <li><a href=\"/#/blog\">Fındık İşleme Nedir? Detaylı Rehber</a></li>\n        <li><a href=\"/#/blog\">Hendek Bölgesinde Fındık İşleme Avantajları</a></li>\n    </ul>', 'Aydın Ak', '2025-01-20', '', '2025-10-31 23:45:38', '2025-10-31 23:45:38', 0, 'Fındık kırma makineleri nasıl çalışır? Teknik özellikler, çalışma prensibi, makine türleri ve bakım rehberi. Profesyonel fındık kırma ekipmanları hakkında detaylı bilgi.', NULL, NULL, NULL);
INSERT INTO `blog_posts` VALUES (17, 'Hendek Bölgesinde Fındık İşleme Avantajları', '', '<h2>???? Hendek Bölgesinde Fındık İşleme Avantajları</h2>\n    <p><strong>Sakarya Hendek</strong>, Türkiye\'nin önemli fındık üretim bölgelerinden biri olarak dikkat çekiyor. Karadeniz bölgesinin fındık üretiminde lider olmasına rağmen, <strong>Hendek ve çevresinde</strong> son yıllarda fındık tarımı hızla gelişiyor.</p>\n    \n    <h3>???? Hendek\'in Coğrafi Konumu ve Avantajları</h3>\n    \n    <h4>???? Stratejik Konum</h4>\n    <ul>\n        <li><strong>İstanbul\'a:</strong> 140 km (1,5 saat)</li>\n        <li><strong>Ankara\'ya:</strong> 230 km (2,5 saat)</li>\n        <li><strong>Düzce\'ye:</strong> 50 km (40 dakika)</li>\n        <li><strong>Adapazarı\'na:</strong> 25 km (20 dakika)</li>\n    </ul>\n    <p>Bu merkezi konum, hem fındık alımı hem de satışı için <strong>lojistik avantajı</strong> sağlar.</p>\n    \n    <h4>????️ İklim Koşulları</h4>\n    <p>Hendek, <strong>geçit iklimi</strong> özelliği gösterir. Karadeniz\'in nemli havası ile İç Anadolu\'nun sert kışları arasında geçiş bölgesidir.</p>\n    <ul>\n        <li><strong>Yıllık Yağış:</strong> 800-1000 mm (fındık için ideal)</li>\n        <li><strong>Sıcaklık:</strong> Yaz 20-28°C, Kış 0-10°C</li>\n        <li><strong>Nem Oranı:</strong> %65-75 (fındık için uygun)</li>\n    </ul>\n    \n    <blockquote style=\"background: #dbeafe; padding: 20px; border-left: 5px solid #3b82f6;\">\n        ???? <strong>Bilgi:</strong> Fındık, yıllık 800-1200 mm yağış alan bölgelerde en kaliteli ürünü verir. \n        Hendek, bu aralıkta yer alarak fındık tarımı için <strong>ideal koşullara</strong> sahiptir.\n    </blockquote>\n    \n    <h3>???? Hendek\'te Fındık Üretimi</h3>\n    \n    <h4>???? İstatistikler</h4>\n    <ul>\n        <li><strong>Fındık Bahçesi Alanı:</strong> 3.500+ dönüm</li>\n        <li><strong>Yıllık Üretim:</strong> 2.000-2.500 ton</li>\n        <li><strong>Üretici Sayısı:</strong> 800+ çiftçi</li>\n        <li><strong>Ortalama Verim:</strong> Dönüm başına 150-200 kg</li>\n    </ul>\n    \n    <h4>???? Yetiştirilen Fındık Çeşitleri</h4>\n    <ol>\n        <li><strong>Tombul:</strong> En kaliteli, yuvarlak yapılı</li>\n        <li><strong>Palaz:</strong> Orta kalite, elips şekilli</li>\n        <li><strong>Mincane:</strong> Sivri uçlu, iri taneli</li>\n        <li><strong>Çakıldak:</strong> Küçük taneli, ezme için ideal</li>\n    </ol>\n    \n    <h3>???? Hendek\'te Fındık İşleme Sektörü</h3>\n    \n    <h4>???? Tesisler ve Kapasiteler</h4>\n    <p>Hendek\'te son 10 yılda fındık işleme tesisleri sayısı hızla arttı:</p>\n    <ul>\n        <li><strong>Modern Tesisler:</strong> 5 adet</li>\n        <li><strong>Toplam Kapasite:</strong> 10.000+ ton/yıl</li>\n        <li><strong>İstihdam:</strong> 200+ kişi</li>\n    </ul>\n    \n    <div style=\"background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;\">\n        <h4>???? Akaydın Tarım - Hendek\'in İlk Profesyonel Fındık İşleme Tesisi</h4>\n        <p>2015 yılında kurulan <strong>Akaydın Tarım</strong>, Hendek\'te <strong>ilk defa profesyonel fındık kırma ve kavurma hizmeti</strong> veren tesis olarak faaliyete başladı.</p>\n        <ul>\n            <li>✅ Saatte 200 kg fındık işleme kapasitesi</li>\n            <li>✅ Son teknoloji fındık kırma makineleri</li>\n            <li>✅ Hijyenik ve gıda güvenliği sertifikalı</li>\n            <li>✅ Vakumlu paketleme hizmeti</li>\n            <li>✅ 10+ yıl tecrübe</li>\n        </ul>\n        <p>???? <a href=\"/#/hendek-findik-kirma\">Detaylı Bilgi İçin Tıklayın</a></p>\n    </div>\n    \n    <h3>✅ Hendek\'te Fındık İşleme Yapmanın 10 Avantajı</h3>\n    \n    <h4>1️⃣ Kaynak Yakınlığı</h4>\n    <p>Hendek ve çevresinde binlerce dönüm fındık bahçesi var. Bu, <strong>taze ürüne hemen ulaşım</strong> demektir.</p>\n    <ul>\n        <li>✅ Toplama sonrası 24 saat içinde işleme</li>\n        <li>✅ Nakliye maliyeti düşük</li>\n        <li>✅ Fire oranı minimum</li>\n    </ul>\n    \n    <h4>2️⃣ Lojistik Avantajı</h4>\n    <p>Hendek, <strong>D-100 ve TEM otoyolu üzerinde</strong> yer alır. Bu sayede:</p>\n    <ul>\n        <li>İstanbul pazarına hızlı erişim</li>\n        <li>Ankara ve İç Anadolu\'ya yakınlık</li>\n        <li>Düzce liman bağlantısı (ihracat için)</li>\n    </ul>\n    \n    <h4>3️⃣ Deneyimli İşgücü</h4>\n    <p>Hendek halkı <strong>nesiller boyu</strong> fındık üretimiyle uğraşıyor:</p>\n    <ul>\n        <li>Fındık kalitesini anlar</li>\n        <li>Doğru işleme tekniklerini bilir</li>\n        <li>Mevsimsel işçilik sorunu yok</li>\n    </ul>\n    \n    <h4>4️⃣ Uygun İklim</h4>\n    <p>Fındık işleme için <strong>kuru ve serin</strong> ortam gerekir. Hendek\'in iklimi buna uygundur:</p>\n    <ul>\n        <li>Yaz aylarında aşırı sıcak yok</li>\n        <li>Kurutma işlemi doğal hava ile yapılabilir</li>\n        <li>Depolama koşulları ideal</li>\n    </ul>\n    \n    <h4>5️⃣ Elektrik ve Su Altyapısı</h4>\n    <ul>\n        <li>Sanayi elektriği mevcut</li>\n        <li>Trifaze elektrik kesintisi çok nadir</li>\n        <li>Temiz su kaynakları</li>\n    </ul>\n    \n    <h4>6️⃣ Organize Sanayi Bölgesi</h4>\n    <p>Hendek\'te OSB planlaması var. Gıda sektörü için ayrılan alanlar mevcut.</p>\n    \n    <h4>7️⃣ Yerel Talep</h4>\n    <p>Hendek ve çevresindeki nüfus (100.000+) fındık tüketimi yüksek:</p>\n    <ul>\n        <li>Ev kullanımı için toplu kırma talebi</li>\n        <li>Pastane ve fırınlar için ticari talep</li>\n        <li>Sakarya, Düzce, Bolu pazarına yakınlık</li>\n    </ul>\n    \n    <h4>8️⃣ Düşük Kira ve İşletme Maliyeti</h4>\n    <p>İstanbul veya Ankara\'ya göre:</p>\n    <ul>\n        <li>%50-60 daha ucuz kira</li>\n        <li>%30 daha ucuz işçilik</li>\n        <li>%20 daha düşük genel giderler</li>\n    </ul>\n    \n    <h4>9️⃣ Devlet Teşvikleri</h4>\n    <p>Hendek, <strong>4. Bölge teşvik kapsamında</strong>:</p>\n    <ul>\n        <li>KDV istisnası</li>\n        <li>Gümrük vergisi muafiyeti</li>\n        <li>Sigorta primi desteği</li>\n        <li>Faiz desteği</li>\n    </ul>\n    \n    <h4>???? Karadeniz\'e Yakınlık</h4>\n    <p>Hendek, Karadeniz bölgesine sadece <strong>1-1,5 saat</strong> mesafede:</p>\n    <ul>\n        <li>Düzce, Akçakoca, Zonguldak fındık pazarları</li>\n        <li>Fındık komisyoncuları ile ağ</li>\n        <li>Karadeniz fındık kalite standardı</li>\n    </ul>\n    \n    <h3>???? Hendek Fındık Sektörü Gelecek Projeksiyonu</h3>\n    \n    <table border=\"1\" cellpadding=\"10\" style=\"width:100%; border-collapse: collapse; margin: 20px 0;\">\n        <tr style=\"background: #f3f4f6;\">\n            <th>Yıl</th>\n            <th>Üretim (ton)</th>\n            <th>Tesis Sayısı</th>\n            <th>İstihdam</th>\n        </tr>\n        <tr>\n            <td><strong>2020</strong></td>\n            <td>1.500</td>\n            <td>3</td>\n            <td>100</td>\n        </tr>\n        <tr>\n            <td><strong>2025 (Mevcut)</strong></td>\n            <td>2.500</td>\n            <td>5</td>\n            <td>200</td>\n        </tr>\n        <tr>\n            <td><strong>2030 (Hedef)</strong></td>\n            <td>5.000</td>\n            <td>10</td>\n            <td>500</td>\n        </tr>\n    </table>\n    \n    <h3>???? Neden Hendek\'te Fındık İşletmeliyim? - Üretici Görüşleri</h3>\n    \n    <blockquote style=\"background: #f0fdf4; padding: 20px; border-left: 5px solid #22c55e; margin: 20px 0;\">\n        <strong>Ali Bey - Hendek\'li Fındık Üreticisi:</strong><br>\n        \"15 yıldır fındık üretiyorum. Önceden fındıklarımı Düzce\'ye götürüyordum. Şimdi Akaydın Tarım sayesinde <strong>yerinde işleme</strong> yapabiliyorum. \n        Hem zaman, hem yakıt tasarrufu. Artık 500 kg fındığımı bile kırdırabiliyorum.\"\n    </blockquote>\n    \n    <blockquote style=\"background: #dbeafe; padding: 20px; border-left: 5px solid #3b82f6; margin: 20px 0;\">\n        <strong>Mehmet Ağa - Karasu\'dan Gelen Üretici:</strong><br>\n        \"Karasu\'dan Hendek\'e geliyorum fındık kırdırmaya. Çünkü <strong>kalite ve hijyen</strong> çok önemli. \n        Akaydın Tarım\'ın makineleri son teknoloji, hasar oranı çok düşük. Vakumlu paketleme ile 2 yıl taze kalıyor.\"\n    </blockquote>\n    \n    <h3>???? Hendek\'te Fındık İşleme Sektörü Neden Büyüyor?</h3>\n    \n    <ol>\n        <li><strong>Organik Tarım Trendi:</strong> Hendek\'te organik fındık üretimi artıyor.</li>\n        <li><strong>Yerel Tüketim:</strong> Sakarya, Düzce, Bolu halkı yerel ürün tercih ediyor.</li>\n        <li><strong>Kalite Bilinci:</strong> Tüketici, profesyonel işlenmiş fındık istiyor.</li>\n        <li><strong>E-Ticaret:</strong> Online fındık satışları artıyor, hızlı kargo için Hendek ideal.</li>\n        <li><strong>İhracat Potansiyeli:</strong> Düzce limanı üzerinden Avrupa\'ya ihracat imkanı.</li>\n    </ol>\n    \n    <h3>???? Hendek Fındığı vs. Karadeniz Fındığı</h3>\n    \n    <table border=\"1\" cellpadding=\"10\" style=\"width:100%; border-collapse: collapse; margin: 20px 0;\">\n        <tr style=\"background: #f3f4f6;\">\n            <th>Özellik</th>\n            <th>Hendek Fındığı</th>\n            <th>Karadeniz Fındığı</th>\n        </tr>\n        <tr>\n            <td><strong>Tane Boyutu</strong></td>\n            <td>Orta-İri (12-15 mm)</td>\n            <td>İri (13-17 mm)</td>\n        </tr>\n        <tr>\n            <td><strong>Yağ Oranı</strong></td>\n            <td>%60-62</td>\n            <td>%62-65</td>\n        </tr>\n        <tr>\n            <td><strong>Kabuk Soyma</strong></td>\n            <td>Kolay</td>\n            <td>Çok Kolay</td>\n        </tr>\n        <tr>\n            <td><strong>Fiyat</strong></td>\n            <td>15-20% Daha Ucuz</td>\n            <td>Referans</td>\n        </tr>\n        <tr>\n            <td><strong>Kullanım</strong></td>\n            <td>Çerez, Ezme, Pasta</td>\n            <td>Çikolata, İhracat</td>\n        </tr>\n    </table>\n    \n    <p><strong>Sonuç:</strong> Hendek fındığı, <strong>fiyat/performans</strong> açısından çok avantajlı. Özellikle <strong>iç piyasa tüketimi</strong> için ideal.</p>\n    \n    <h3>???? Fındık İşletmek İçin İletişime Geçin</h3>\n    \n    <div style=\"background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0;\">\n        <h3 style=\"margin-top: 0;\">Hendek\'te Profesyonel Fındık İşleme</h3>\n        <p style=\"font-size: 18px;\">Akaydın Tarım olarak, fındıklarınızı <strong>en modern ekipmanlarla</strong> işliyoruz.</p>\n        <p style=\"font-size: 22px; font-weight: bold;\">\n            ???? Hemen Bilgi Alın<br>\n            ???? Hendek / Sakarya\n        </p>\n        <p>\n            <a href=\"/#/hendek-findik-kirma\" style=\"background: white; color: #d97706; padding: 15px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 10px;\">\n                Fındık Kırma Hizmetimiz\n            </a>\n        </p>\n    </div>\n    \n    <h3>???? İlgili Makaleler</h3>\n    <ul>\n        <li><a href=\"/#/blog\">Fındık İşleme Nedir? Detaylı Rehber</a></li>\n        <li><a href=\"/#/blog\">Fındık Kırma Makineleri Nasıl Çalışır?</a></li>\n    </ul>', 'Aydın Ak', '2025-01-25', '', '2025-10-31 23:45:38', '2025-10-31 23:45:38', 0, 'Hendek bölgesinde fındık işleme avantajları nelerdir? Coğrafi konum, iklim, lojistik ve ekonomik avantajlar. Sakarya Hendek\'te fındık sektörü analizi.', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for contact_messages
-- ----------------------------
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of contact_messages
-- ----------------------------

-- ----------------------------
-- Table structure for contact_page
-- ----------------------------
DROP TABLE IF EXISTS `contact_page`;
CREATE TABLE `contact_page`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `whatsapp_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `facebook_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `instagram_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `twitter_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `linkedin_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `youtube_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `company_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'Akaydın Tarım',
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `working_hours` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `map_embed` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of contact_page
-- ----------------------------

-- ----------------------------
-- Table structure for hazelnut_prices
-- ----------------------------
DROP TABLE IF EXISTS `hazelnut_prices`;
CREATE TABLE `hazelnut_prices`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `price` decimal(10, 2) NOT NULL,
  `daily_change` decimal(10, 2) NULL DEFAULT 0.00,
  `change_percentage` decimal(5, 2) NULL DEFAULT 0.00,
  `source` enum('manual','scraped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'manual',
  `scraped_price` decimal(10, 2) NULL DEFAULT NULL,
  `last_scraped_at` timestamp NULL DEFAULT NULL,
  `update_mode` enum('manual','automatic') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'manual',
  `scraping_enabled` tinyint(1) NULL DEFAULT 1,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of hazelnut_prices
-- ----------------------------

-- ----------------------------
-- Table structure for hero_content
-- ----------------------------
DROP TABLE IF EXISTS `hero_content`;
CREATE TABLE `hero_content`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cta` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `background_gradient` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'from-green-600 via-green-700 to-blue-800',
  `background_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `order_index` int NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of hero_content
-- ----------------------------
INSERT INTO `hero_content` VALUES (8, 'Fındık Üretiminizi', 'Bir Sonraki Seviyeye Taşıyın', 'Modern tarım teknikleri ve uzman danışmanlık hizmetleriyle verimliliğinizi artırın.', 'Hemen Başlayın', 'from-green-600 to-blue-800', '/akaydin-tarim/uploads/hero/1761915786_bf8fe5ea5e0da7bf.jpg', 1, 1, '2025-10-31 14:03:03', '2025-10-31 16:03:06');
INSERT INTO `hero_content` VALUES (9, 'Organomineral Gübreler ile', 'Doğal ve Verimli Üretim', 'Çevre dostu gübre çözümlerimizle hem toprağınızı hem de ürününüzü koruyun.', 'Ürünlerimizi Keşfedin', 'from-green-600 via-green-700 to-blue-800', '/akaydin-tarim/akaydin/images/473292163_122195934224188360_3217727389005714106_n.jpg', 1, 1, '2025-10-31 15:04:28', '2025-10-31 15:19:06');

-- ----------------------------
-- Table structure for page_seo
-- ----------------------------
DROP TABLE IF EXISTS `page_seo`;
CREATE TABLE `page_seo`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `page_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `meta_keywords` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `og_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `og_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `og_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `canonical_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `noindex` tinyint(1) NULL DEFAULT 0,
  `nofollow` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `page_path`(`page_path` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of page_seo
-- ----------------------------

-- ----------------------------
-- Table structure for page_views
-- ----------------------------
DROP TABLE IF EXISTS `page_views`;
CREATE TABLE `page_views`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `referrer` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `entry_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_update_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `time_on_page` int NULL DEFAULT 0,
  `scroll_percentage` int NULL DEFAULT 0,
  `clicks_count` int NULL DEFAULT 0,
  `scroll_events` int NULL DEFAULT 0,
  `mouse_movements` int NULL DEFAULT 0,
  `is_exit_page` tinyint(1) NULL DEFAULT 0,
  `exit_time` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_session_page`(`session_id` ASC, `page_path` ASC) USING BTREE,
  INDEX `idx_entry_time`(`entry_time` ASC) USING BTREE,
  INDEX `idx_is_exit`(`is_exit_page` ASC) USING BTREE,
  INDEX `idx_realtime_page_views_session_page`(`session_id` ASC, `page_path` ASC) USING BTREE,
  CONSTRAINT `page_views_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `active_visitors` (`session_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of page_views
-- ----------------------------

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10, 2) NULL DEFAULT 0.00,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_featured` tinyint(1) NULL DEFAULT 0,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `seo_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `seo_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `seo_keywords` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (17, 'Kavrulmuş Fındık', 'Kavrulmuş Fındık', 'Fındık Ürünleri', 0.00, '/akaydin-tarim/uploads/product/1761920665_ab31e4ab115e6559.jpg', 1, '[\"\\/akaydin-tarim\\/uploads\\/product\\/1761920665_ab31e4ab115e6559.jpg\"]', '2025-10-31 17:10:09', '2025-10-31 17:24:25', NULL, NULL, NULL);
INSERT INTO `products` VALUES (18, 'OrganoMineral Gübre', '15 15 15 Organomineral gübre', 'Gübreler', 0.00, '/akaydin-tarim/uploads/product/1761920556_47d0d36298729bc6.jpg', 1, '[\"\\/akaydin-tarim\\/uploads\\/product\\/1761920556_47d0d36298729bc6.jpg\"]', '2025-10-31 17:20:55', '2025-10-31 17:22:37', NULL, NULL, NULL);
INSERT INTO `products` VALUES (19, 'Fındık Ezmesi', 'Cam kananoz da fındık ezmesi', 'Fındık  Ürünleri', 0.00, '/akaydin-tarim/uploads/product/1761920513_2df6c81ad19d61cd.jpg', 1, '[\"\\/akaydin-tarim\\/uploads\\/product\\/1761920513_2df6c81ad19d61cd.jpg\"]', '2025-10-31 17:21:53', '2025-10-31 17:21:53', NULL, NULL, NULL);
INSERT INTO `products` VALUES (20, 'Kabuklu Fındık', 'Taze Kabuklu Fındık', 'Fındık Ürünleri', 0.00, '/akaydin-tarim/uploads/product/1761920635_f83c3c947342f579.jpg', 1, '[\"\\/akaydin-tarim\\/uploads\\/product\\/1761920635_f83c3c947342f579.jpg\"]', '2025-10-31 17:23:55', '2025-10-31 17:23:55', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for seo_settings
-- ----------------------------
DROP TABLE IF EXISTS `seo_settings`;
CREATE TABLE `seo_settings`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Akaydın Tarım',
  `site_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `site_keywords` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `site_author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'Akaydın Tarım',
  `og_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `og_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `og_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `og_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `twitter_card` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'summary_large_image',
  `twitter_site` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `twitter_creator` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `canonical_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `robots_txt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `google_analytics_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `google_search_console` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `facebook_pixel_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `schema_organization` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `sitemap_enabled` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of seo_settings
-- ----------------------------

-- ----------------------------
-- Table structure for services
-- ----------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `seo_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `seo_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `seo_keywords` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of services
-- ----------------------------
INSERT INTO `services` VALUES (16, 'Fındık Üretimi Danışmanlığı', 'Modern tarım teknikleri ve uzman ekibimizle verimliliğinizi artırıyoruz. Toprak analizinden hasat planlamasına kadar yanınızdayız.', 'leaf', '/akaydin-tarim/akaydin/images/DRON.jpeg', '2025-10-31 16:07:39', '2025-10-31 16:16:41', 'Fındık Üretimi Danışmanlığı - Akaydin Tarım', 'Modern tarım teknikleri ve uzman ekibimizle fındık üretim verimliliğinizi artırıyoruz. Toprak analizi, gübreleme, budama ve hasat planlaması hizmetleri.', 'fındık üretimi, tarım danışmanlığı, toprak analizi, hasat planlaması, fındık yetiştirme');
INSERT INTO `services` VALUES (17, 'Fındık İşleme Hizmetleri', 'Son teknoloji makinelerimizle fındık kırma, kavurma ve vakumlu paketleme hizmetleri sunuyoruz. Ürününüzün değerini koruyoruz.', 'settings', '/akaydin-tarim/uploads/service/1761919091_5c3119074a561f76.jpg', '2025-10-31 16:07:50', '2025-10-31 16:58:11', 'Fındık İşleme Hizmetleri - Akaydin Tarım', 'Son teknoloji makinelerimizle fındık kırma, kavurma ve vakumlu paketleme hizmetleri. Ürününüzün kalitesini ve değerini koruyoruz.', 'fındık işleme, fındık kırma, fındık kavurma, vakumlu paketleme, fındık paketleme');
INSERT INTO `services` VALUES (19, 'Organomineral Gübre Bayiliği', 'Toprağınızın ihtiyacı olan zengin içerikli, yüksek kaliteli organomineral gübre çeşitlerimizle fındık bahçenizi canlandırın.', 'package', '/akaydin-tarim/uploads/service/1761917531_3382cdbd50dbfa65.jpg', '2025-10-31 16:08:08', '2025-10-31 16:32:11', 'Organomineral Gübre Bayiliği - Akaydin Tarım', 'Zengin içerikli, yüksek kaliteli organomineral gübre çeşitlerimizle toprağınızı besleyin. Fındık bahçenizin verimi için güvenilir çözüm.', 'organomineral gübre, toprak gübresi, fındık gübresi, tarım gübresi, organik gübre');

-- ----------------------------
-- Table structure for visitor_actions
-- ----------------------------
DROP TABLE IF EXISTS `visitor_actions`;
CREATE TABLE `visitor_actions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type` enum('click','scroll','form_submit','download','external_link','search','contact') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `element_selector` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `element_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `page_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `additional_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `action_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_action_type`(`action_type` ASC) USING BTREE,
  INDEX `idx_page_path`(`page_path` ASC) USING BTREE,
  INDEX `idx_action_at`(`action_at` ASC) USING BTREE,
  CONSTRAINT `visitor_actions_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `active_visitors` (`session_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of visitor_actions
-- ----------------------------

-- ----------------------------
-- Table structure for visitor_sessions
-- ----------------------------
DROP TABLE IF EXISTS `visitor_sessions`;
CREATE TABLE `visitor_sessions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `device_type` enum('desktop','mobile','tablet') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'desktop',
  `browser` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `operating_system` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `first_visit_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_activity_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `total_page_views` int NULL DEFAULT 0,
  `session_duration` int NULL DEFAULT 0,
  `is_bounce` tinyint(1) NULL DEFAULT 0,
  `referrer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `utm_source` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `utm_medium` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `utm_campaign` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `visitor_fingerprint` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_unique_visitor` tinyint(1) NULL DEFAULT 1,
  `is_return_visitor` tinyint(1) NULL DEFAULT 0,
  `cookie_enabled` tinyint(1) NULL DEFAULT 1,
  `language` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_ip_address`(`ip_address` ASC) USING BTREE,
  INDEX `idx_first_visit`(`first_visit_at` ASC) USING BTREE,
  INDEX `idx_last_activity`(`last_activity_at` ASC) USING BTREE,
  INDEX `idx_visitor_fingerprint`(`visitor_fingerprint` ASC) USING BTREE,
  INDEX `idx_fingerprint_created`(`visitor_fingerprint` ASC, `created_at` ASC) USING BTREE,
  INDEX `idx_unique_visitor`(`is_unique_visitor` ASC, `created_at` ASC) USING BTREE,
  INDEX `idx_return_visitor`(`is_return_visitor` ASC, `created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of visitor_sessions
-- ----------------------------

-- ----------------------------
-- Procedure structure for CleanupInactiveVisitors
-- ----------------------------
DROP PROCEDURE IF EXISTS `CleanupInactiveVisitors`;
delimiter ;;
CREATE PROCEDURE `CleanupInactiveVisitors`()
BEGIN
  
  DELETE FROM active_visitors_realtime 
  WHERE last_activity_time < DATE_SUB(NOW(), INTERVAL 30 MINUTE)
     OR last_heartbeat < DATE_SUB(NOW(), INTERVAL 2 MINUTE);
     
  
  DELETE FROM realtime_page_views 
  WHERE last_update_time < DATE_SUB(NOW(), INTERVAL 1 HOUR);
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for CreateTestActiveVisitors
-- ----------------------------
DROP PROCEDURE IF EXISTS `CreateTestActiveVisitors`;
delimiter ;;
CREATE PROCEDURE `CreateTestActiveVisitors`()
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE session_id VARCHAR(255);
  DECLARE random_page VARCHAR(500);
  DECLARE random_country VARCHAR(100);
  DECLARE random_city VARCHAR(100);
  DECLARE random_device ENUM('desktop', 'mobile', 'tablet');
  
  WHILE i < 10 DO
    SET session_id = CONCAT('test_session_', i, '_', UNIX_TIMESTAMP());
    SET random_page = CASE FLOOR(RAND() * 6)
      WHEN 0 THEN '/'
      WHEN 1 THEN '/products'
      WHEN 2 THEN '/services'
      WHEN 3 THEN '/about'
      WHEN 4 THEN '/contact'
      ELSE '/blog'
    END;
    SET random_country = CASE FLOOR(RAND() * 4)
      WHEN 0 THEN 'Turkey'
      WHEN 1 THEN 'Germany'
      WHEN 2 THEN 'USA'
      ELSE 'France'
    END;
    SET random_city = CASE random_country
      WHEN 'Turkey' THEN 'Istanbul'
      WHEN 'Germany' THEN 'Berlin'
      WHEN 'USA' THEN 'New York'
      ELSE 'Paris'
    END;
    SET random_device = CASE FLOOR(RAND() * 3)
      WHEN 0 THEN 'desktop'
      WHEN 1 THEN 'mobile'
      ELSE 'tablet'
    END;
    
    INSERT INTO active_visitors_realtime (
      session_id, visitor_fingerprint, ip_address, device_type, browser,
      operating_system, country, city, current_page, current_page_title,
      is_new_visitor, session_start_time, last_activity_time, last_heartbeat,
      total_page_views, session_duration, heartbeat_count
    ) VALUES (
      session_id,
      CONCAT('fp_', MD5(session_id)),
      CONCAT('192.168.1.', FLOOR(RAND() * 255)),
      random_device,
      CASE random_device
        WHEN 'mobile' THEN 'Safari Mobile'
        WHEN 'tablet' THEN 'Safari Tablet'
        ELSE 'Chrome Desktop'
      END,
      CASE random_device
        WHEN 'mobile' THEN 'iOS'
        WHEN 'tablet' THEN 'iPadOS'
        ELSE 'Windows'
      END,
      random_country,
      random_city,
      random_page,
      CONCAT('Test Page - ', random_page),
      RAND() > 0.3, 
      DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) MINUTE),
      DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 5) SECOND),
      DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 10) SECOND),
      FLOOR(RAND() * 10) + 1,
      FLOOR(RAND() * 600) + 60,
      FLOOR(RAND() * 50) + 5
    );
    
    SET i = i + 1;
  END WHILE;
END
;;
delimiter ;

-- ----------------------------
-- Event structure for auto_cleanup_inactive_visitors
-- ----------------------------
DROP EVENT IF EXISTS `auto_cleanup_inactive_visitors`;
delimiter ;;
CREATE EVENT `auto_cleanup_inactive_visitors`
ON SCHEDULE
EVERY '5' MINUTE STARTS '2025-07-12 13:59:56'
DO CALL CleanupInactiveVisitors()
;;
delimiter ;

-- ----------------------------
-- Event structure for cleanup_inactive_visitors
-- ----------------------------
DROP EVENT IF EXISTS `cleanup_inactive_visitors`;
delimiter ;;
CREATE EVENT `cleanup_inactive_visitors`
ON SCHEDULE
EVERY '5' MINUTE STARTS '2025-07-12 14:19:03'
DO CALL CleanupInactiveVisitors()
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
